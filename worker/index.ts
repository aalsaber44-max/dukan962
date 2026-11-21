import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  GEMINI_BASE_URL?: string;
  ASSETS: any;
  CHAT_LIMITER?: any;
}

// النموذج الأساسي المثبّت، ثم سلسلة احتياطية عند ضغط الخادم (503/429)
const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
];

const MAX_MESSAGE_LENGTH = 700;
const MAX_HISTORY_MESSAGES = 6;
const AI_TIMEOUT_MS = 15000;
// ميزانية الرد: الرد نفسه قصير، لكن التفكير يستهلك من نفس الميزانية
// لذلك نرفعها فوق حاجة الرد بكثير + نضبط مستوى التفكير على low
const MAX_OUTPUT_TOKENS = 1200;
const CACHE_TTL_SECONDS = 60 * 60 * 6; // 6 ساعات للأسئلة المتكررة
const MEMORY_CACHE_LIMIT = 120;
const MAX_ACTIONS = 4;

// ---------- الأنواع ----------

type CompactProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  desc: string;
};

type CompactCategory = { id: string; name: string };

type ChatAction =
  | { type: 'navigate_category'; categoryId: string }
  | { type: 'add_to_cart'; productId: string; quantity: number }
  | { type: 'show_products'; productIds: string[] };

type ChatPayload = {
  answer: string;
  showFaqButton: boolean;
  actions: ChatAction[];
};

// ---------- تعليمات نشمي ----------

const STORE_KNOWLEDGE = `
أنت "نشمي"، مساعد خدمة العملاء والبائع الرسمي لمتجر Dukan962 في الأردن.
أجب بالعربية الواضحة واللطيفة، ويمكنك استخدام اللهجة الأردنية البسيطة.

معلومات المتجر المعتمدة:
- التوصيل عادة من 24 إلى 48 ساعة داخل عمّان، ومن يومين إلى 4 أيام عمل لبقية المحافظات.
- يوفر المتجر معاينة المنتج عند وصول المندوب وقبل الاستلام والدفع.
- طرق الدفع: الدفع النقدي عند الاستلام بعد المعاينة، أو التحويل عبر CliQ.
- لإتمام الطلب: يضيف العميل المنتجات إلى السلة ثم يتابع إلى إتمام الطلب.
- يمكن أيضًا الاستفسار والطلب عبر واتساب.
- رسوم التوصيل تُحسب حسب منطقة التوصيل وقيمة الطلب، ويظهر الإجمالي قبل تأكيد الطلب.
- لتتبع الطلب يستخدم العميل صفحة تتبع الطلبات ورقم الطلب.
- يمكن رفض المنتج عند المعاينة قبل الدفع إذا لم يطابق الوصف. لا يوجد إرجاع بعد الدفع إلا في حالات الضمان.

قواعد مهمة:
1. أجب باختصار شديد، من جملة إلى ثلاث جمل.
2. لا تخترع رسومًا أو مواعيد أو سياسات.
3. لا تقل إنك أنشأت طلبًا أو أكدت دفعًا؛ أنت لا تنفذ هذه العمليات.
4. إذا سألك العميل عن منتج أو سعر أو توفر، ابحث في "قائمة المنتجات" المرفقة مع الرسالة.
5. إذا وجدت المنتج في القائمة، أخبره بالسعر المتوفر واسمه.
6. إذا لم تجد المنتج في القائمة، اعتذر منه وقل له أن هذا المنتج قد يكون غير متوفر حالياً، واقترح عليه تصفح المتجر.
7. عند السؤال عن التوصيل أو الدفع أو تأكيد الطلب، أجب بإيجاز ووجّه العميل صراحةً للضغط على زر «الأسئلة الشائعة وطريقة الطلب».
8. لا تطلب كلمات مرور أو أرقام بطاقات.

قواعد الأوامر (actions):
- تُرجع دائماً رداً مهيكلاً يحتوي answer و actions.
- استخدم "show_products" فقط عندما تذكر منتجات محددة موجودة في القائمة، وضع معرّفاتها الحقيقية (id) كما هي مكتوبة، بحد أقصى 4 منتجات.
- استخدم "navigate_category" عندما يطلب العميل الانتقال إلى قسم معين، وcategoryId يجب أن يكون من قائمة الأقسام المرفقة أو "all" للرئيسية.
- استخدم "add_to_cart" فقط إذا طلب العميل صراحةً إضافة منتج إلى السلة. لا تضف منتجات من تلقاء نفسك، ولا تتجاوز الكمية المتاحة.
- لا تخترع معرّفات (id) غير موجودة في القوائم المرفقة. إن لم تكن متأكداً اترك actions فارغة [].
- إذا لم تحتج أي أمر، أعد actions: [].
`;

// ---------- مخطّط الرد المهيكل ----------

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: 'الرد النصي المختصر الموجه للعميل بالعربية.',
    },
    showFaqButton: {
      type: Type.BOOLEAN,
      description: 'true إذا كان السؤال عن التوصيل أو الدفع أو طريقة الطلب.',
    },
    actions: {
      type: Type.ARRAY,
      description: 'أوامر واجهة المتجر المطلوب تنفيذها بعد الرد.',
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: ['navigate_category', 'add_to_cart', 'show_products'],
          },
          categoryId: { type: Type.STRING },
          productId: { type: Type.STRING },
          productIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          quantity: { type: Type.INTEGER },
        },
        required: ['type'],
        propertyOrdering: ['type', 'categoryId', 'productId', 'productIds', 'quantity'],
      },
    },
  },
  required: ['answer', 'actions'],
  propertyOrdering: ['answer', 'showFaqButton', 'actions'],
};

// ---------- أدوات ----------

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function isSupportTopic(message: string): boolean {
  const text = message.toLowerCase();
  const terms = [
    'توصيل', 'التوصيل', 'الشحن', 'اشحن', 'يوصل', 'التسليم', 'المندوب',
    'دفع', 'الدفع', 'كاش', 'نقدي', 'كليك', 'cliq', 'تحويل',
    'طلب', 'الطلب', 'اطلب', 'أطلب', 'تأكيد', 'تاكيد',
    'اتمام', 'إتمام', 'السلة', 'checkout', 'order', 'delivery', 'payment',
  ];
  return terms.some((term) => text.includes(term));
}

function cleanHistory(value: unknown): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  if (!Array.isArray(value)) return [];
  return value
    .slice(-MAX_HISTORY_MESSAGES)
    .filter((item): item is { role: string; text: string } => {
      return Boolean(
        item && typeof item === 'object' &&
        typeof (item as { text?: unknown }).text === 'string' &&
        ['user', 'model'].includes(String((item as { role?: unknown }).role))
      );
    })
    .map((item) => ({
      role: item.role as 'user' | 'model',
      parts: [{ text: item.text.slice(0, MAX_MESSAGE_LENGTH) }],
    }));
}

function cleanCategories(value: unknown): CompactCategory[] {
  if (!Array.isArray(value)) return [];
  const result: CompactCategory[] = [];
  const seen = new Set<string>();

  for (const raw of value.slice(0, 40)) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as { id?: unknown; name?: unknown };
    const id = typeof item.id === 'string' ? item.id.trim() : '';
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    result.push({ id, name });
  }
  return result;
}

function cleanProducts(value: unknown): CompactProduct[] {
  if (!Array.isArray(value)) return [];
  const result: CompactProduct[] = [];
  const seen = new Set<string>();

  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as Record<string, unknown>;
    const id = typeof item.id === 'string' ? item.id.trim() : '';
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);

    result.push({
      id,
      name: name.slice(0, 90),
      price: Math.max(0, Number(item.price) || 0),
      category: typeof item.category === 'string' ? item.category.slice(0, 40) : '',
      stock: Math.max(0, Math.floor(Number(item.stock) || 0)),
      desc: typeof item.desc === 'string' ? item.desc.replace(/\s+/g, ' ').slice(0, 70) : '',
    });
  }
  return result;
}

// سطر واحد لكل منتج لتقليل التوكنز
function buildCatalog(products: CompactProduct[]): string {
  if (products.length === 0) return 'لا توجد منتجات متاحة حالياً.';
  return products
    .map((p) => {
      const stockLabel = p.stock > 0 ? `متوفر:${p.stock}` : 'نفدت الكمية';
      const desc = p.desc ? ` | ${p.desc}` : '';
      return `- id=${p.id} | ${p.name} | ${p.price} د.أ | ${p.category || 'غير مصنّف'} | ${stockLabel}${desc}`;
    })
    .join('\n');
}

function buildCategoryList(categories: CompactCategory[]): string {
  if (categories.length === 0) return 'لا توجد أقسام.';
  return categories.map((c) => `- id=${c.id} | ${c.name}`).join('\n');
}

// ---------- التحقق من الأوامر قبل إرجاعها للواجهة ----------

function sanitizeActions(
  raw: unknown,
  products: CompactProduct[],
  categories: CompactCategory[]
): ChatAction[] {
  if (!Array.isArray(raw)) return [];

  const productMap = new Map(products.map((p) => [p.id, p]));
  const categoryIds = new Set<string>(['all', ...categories.map((c) => c.id)]);
  const actions: ChatAction[] = [];

  for (const entry of raw) {
    if (actions.length >= MAX_ACTIONS) break;
    if (!entry || typeof entry !== 'object') continue;
    const action = entry as Record<string, unknown>;
    const type = String(action.type || '');

    if (type === 'navigate_category') {
      const categoryId = typeof action.categoryId === 'string' ? action.categoryId.trim() : '';
      if (!categoryId || !categoryIds.has(categoryId)) continue;
      actions.push({ type: 'navigate_category', categoryId });
      continue;
    }

    if (type === 'add_to_cart') {
      const productId = typeof action.productId === 'string' ? action.productId.trim() : '';
      const product = productMap.get(productId);
      if (!product || product.stock <= 0) continue;
      const requested = Math.floor(Number(action.quantity) || 1);
      const quantity = Math.min(Math.max(1, requested), product.stock);
      actions.push({ type: 'add_to_cart', productId: product.id, quantity });
      continue;
    }

    if (type === 'show_products') {
      const ids = Array.isArray(action.productIds) ? action.productIds : [];
      const productIds = ids
        .map((id) => (typeof id === 'string' ? id.trim() : ''))
        .filter((id): id is string => Boolean(id) && productMap.has(id))
        .slice(0, 4);
      if (productIds.length === 0) continue;
      actions.push({ type: 'show_products', productIds });
    }
  }

  return actions;
}

// ---------- كاش طبقتين: ذاكرة الـ isolate + Cache API ----------

const memoryCache = new Map<string, { expiresAt: number; payload: ChatPayload }>();

function getEdgeCache(): any {
  try {
    return (globalThis as any).caches?.default ?? null;
  } catch {
    return null;
  }
}

async function hashKey(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 40);
}

async function readCache(key: string): Promise<ChatPayload | null> {
  const now = Date.now();
  const local = memoryCache.get(key);
  if (local) {
    if (local.expiresAt > now) return local.payload;
    memoryCache.delete(key);
  }

  const cache = getEdgeCache();
  if (!cache) return null;

  try {
    const hit = await cache.match(new Request(`https://nashmi-cache.internal/chat/${key}`));
    if (!hit) return null;
    const payload = (await hit.json()) as ChatPayload;
    if (!payload || typeof payload.answer !== 'string' || !payload.answer.trim()) return null;
    memoryCache.set(key, { expiresAt: now + CACHE_TTL_SECONDS * 1000, payload });
    return payload;
  } catch {
    return null;
  }
}

async function writeCache(key: string, payload: ChatPayload): Promise<void> {
  if (memoryCache.size >= MEMORY_CACHE_LIMIT) {
    const oldest = memoryCache.keys().next();
    if (!oldest.done) memoryCache.delete(oldest.value);
  }
  memoryCache.set(key, { expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000, payload });

  const cache = getEdgeCache();
  if (!cache) return;

  try {
    await cache.put(
      new Request(`https://nashmi-cache.internal/chat/${key}`),
      new Response(JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': `max-age=${CACHE_TTL_SECONDS}`,
        },
      })
    );
  } catch {
    // الكاش تحسين أداء فقط — نتجاهل فشله
  }
}

// ---------- استدعاء Gemini ----------

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// تقليل التفكير للنماذج التي تدعمه حتى لا يأكل ميزانية JSON
function thinkingConfigFor(model: string): { thinkingConfig?: { thinkingLevel?: ThinkingLevel; thinkingBudget?: number } } {
  const name = model.toLowerCase();
  if (name.startsWith('gemini-3')) {
    return { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } };
  }
  if (name.startsWith('gemini-2.5')) {
    return { thinkingConfig: { thinkingBudget: 0 } };
  }
  // gemini-2.0 لا يدعم إعدادات التفكير
  return {};
}

async function generateWithFallback(
  ai: GoogleGenAI,
  models: string[],
  contents: any[],
  systemInstruction: string
): Promise<string> {
  let lastError: any = null;

  for (const model of models) {
    // محاولتان لكل نموذج قبل الانتقال للنموذج الاحتياطي التالي
    for (let attempt = 1; attempt <= 2; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      try {
        const result = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA as any,
            abortSignal: controller.signal,
            ...thinkingConfigFor(model),
          },
        });
        clearTimeout(timer);

        const finishReason = String((result?.candidates?.[0] as any)?.finishReason || '');
        const text = String(result?.text || '');

        // رد مقطوع = JSON غير صالح، لذا نعامله كفشل وننتقل للمحاولة/النموذج التالي
        if (finishReason === 'MAX_TOKENS') {
          lastError = new Error('MAX_TOKENS');
          console.warn(
            `Model ${model} (attempt ${attempt}) truncated at ${MAX_OUTPUT_TOKENS} tokens`
          );
          if (attempt < 2) await sleep(400);
          continue;
        }

        return text;
      } catch (err: any) {
        clearTimeout(timer);
        lastError = err;

        const message = String(err?.message || '');
        const isOverloaded =
          err?.status === 503 ||
          err?.status === 429 ||
          message.includes('503') ||
          message.includes('429') ||
          message.includes('UNAVAILABLE') ||
          message.includes('high demand');

        console.warn(`Model ${model} (attempt ${attempt}) failed:`, message);

        if (isOverloaded) {
          if (attempt < 2) await sleep(600);
          continue;
        }

        // خطأ غير متعلق بالضغط (مثل مفتاح خاطئ) — لا فائدة من التبديل
        throw err;
      }
    }
  }

  throw lastError;
}

function parseModelJson(raw: string): { answer: string; showFaqButton: boolean; actions: unknown } | null {
  if (!raw) return null;

  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```[a-zA-Z]*\s*/, '').replace(/```$/, '').trim();
  }

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;

  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    const answer = typeof parsed.answer === 'string' ? parsed.answer.trim() : '';
    if (!answer) return null;
    return {
      answer,
      showFaqButton: Boolean(parsed.showFaqButton),
      actions: parsed.actions,
    };
  } catch {
    return null;
  }
}

// ---------- Worker ----------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== '/api/chat') {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== 'POST') {
      return json({ success: false, message: 'طريقة الطلب غير مدعومة.' }, 405);
    }

    try {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (env.CHAT_LIMITER) {
        const limit = await env.CHAT_LIMITER.limit({ key: ip });
        if (!limit.success) {
          return json({ success: false, message: 'وصلت إلى الحد المؤقت للرسائل. حاول بعد دقيقة.' }, 429);
        }
      }

      const body = await request.json() as {
        message?: unknown;
        history?: unknown;
        products?: unknown;
        categories?: unknown;
      };

      if (typeof body.message !== 'string') {
        return json({ success: false, message: 'اكتب سؤالك أولاً.' }, 400);
      }

      const message = body.message.trim();
      if (!message || message.length > MAX_MESSAGE_LENGTH) {
        return json({ success: false, message: `الرسالة يجب أن تكون بين حرف و${MAX_MESSAGE_LENGTH} حرف.` }, 400);
      }

      const apiKey = (env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
      if (!apiKey) {
        return json({ success: false, message: 'المساعد غير مُعدّ حالياً.' }, 503);
      }

      const history = cleanHistory(body.history);
      const products = cleanProducts(body.products);
      const categories = cleanCategories(body.categories);
      const catalog = buildCatalog(products);
      const categoryList = buildCategoryList(categories);

      // الكاش للرسالة الأولى فقط (بدون سياق محادثة) حتى لا نعيد ردوداً خارج السياق
      const cacheable = history.length === 0;
      const cacheKey = cacheable
        ? await hashKey(`${message.toLowerCase()}\n${catalog}\n${categoryList}`)
        : '';

      if (cacheable) {
        const cached = await readCache(cacheKey);
        if (cached) {
          return json(
            {
              success: true,
              answer: cached.answer,
              actions: cached.actions,
              showFaqButton: cached.showFaqButton,
              cached: true,
            },
            200,
            { 'X-Nashmi-Cache': 'HIT' }
          );
        }
      }

      const baseUrl = (env.GEMINI_BASE_URL || '').trim();
      const ai = new GoogleGenAI({
        apiKey,
        ...(baseUrl ? { httpOptions: { baseUrl } } : {}),
      });

      const augmentedMessage = `[الأقسام المتاحة في المتجر]:
${categoryList}

[قائمة المنتجات المتاحة حالياً في المتجر]:
${catalog}

[سؤال الزبون]:
${message}`;

      // النموذج المثبّت أولاً، ثم الاحتياطية
      const customModel = (env.GEMINI_MODEL || '').trim();
      const primary = customModel || PRIMARY_MODEL;
      const modelsToTry = [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)];

      const raw = await generateWithFallback(
        ai,
        modelsToTry,
        [...history, { role: 'user', parts: [{ text: augmentedMessage }] }],
        STORE_KNOWLEDGE
      );

      const parsed = parseModelJson(raw);
      if (!parsed) {
        return json({
          success: false,
          message: 'عذراً، لم أتمكن من صياغة رد واضح. جرب تسألني مرة ثانية.',
        }, 503);
      }

      const payload: ChatPayload = {
        answer: parsed.answer,
        showFaqButton: parsed.showFaqButton || isSupportTopic(message),
        actions: sanitizeActions(parsed.actions, products, categories),
      };

      if (cacheable) {
        await writeCache(cacheKey, payload);
      }

      return json(
        {
          success: true,
          answer: payload.answer,
          actions: payload.actions,
          showFaqButton: payload.showFaqButton,
          cached: false,
        },
        200,
        { 'X-Nashmi-Cache': 'MISS' }
      );
    } catch (error: any) {
      // يظهر السبب التقني الكامل في سجل Cloudflare Workers فقط
      console.error('Dukan962 AI Final Error:', error?.message || error);

      if (error?.name === 'AbortError') {
        return json({
          success: false,
          message: 'المساعد استغرق وقتاً طويلاً للرد، جرب تبعت سؤالك مرة ثانية 🙏',
        }, 504);
      }

      return json({
        success: false,
        message: 'المساعد نشمي مشغول شوي حالياً بسبب ضغط الطلبات، جرب تبعت رسالتك كمان ثواني 🙏',
      }, 503);
    }
  },
};
