import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

// ==========================================
// 1. واجهة البيئة (Environment Variables)
// ==========================================
interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  GEMINI_BASE_URL?: string;
  GROQ_API_KEY?: string;
  GROQ_MODEL?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  ASSETS: any;
  CHAT_LIMITER?: any;
}

// ==========================================
// 2. الثوابت والإعدادات
// ==========================================
const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
];

const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
const DEFAULT_OPENROUTER_MODEL = 'openrouter/free';

const MAX_MESSAGE_LENGTH = 700;
const MAX_HISTORY_MESSAGES = 6;
const AI_TIMEOUT_MS = 15000; // وقت الانتظار لكل مزود على حدة
const GLOBAL_TIMEOUT_MS = 25000; // وقت الانتظار الإجمالي للطلب بالكامل
const MAX_OUTPUT_TOKENS = 1200;
const CACHE_TTL_SECONDS = 60 * 60 * 6; 
const MEMORY_CACHE_LIMIT = 120;
const MAX_ACTIONS = 4;

// ==========================================
// 3. الأنواع (Types)
// ==========================================
type CompactProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  desc: string;
};

type CompactCategory = { 
  id: string; 
  name: string 
};

type ChatAction =
  | { type: 'navigate_category'; categoryId: string }
  | { type: 'add_to_cart'; productId: string; quantity: number }
  | { type: 'show_products'; productIds: string[] };

type ChatPayload = {
  answer: string;
  showFaqButton: boolean;
  actions: ChatAction[];
};

// ==========================================
// 4. تعليمات نشمي (System Prompt)
// ==========================================
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
- تُرجع دائماً رداً مهيكلاً بصيغة JSON يحتوي على المفاتيح: answer (نص), showFaqButton (boolean), actions (مصفوفة).
- استخدم "show_products" فقط عندما تذكر منتجات محددة موجودة في القائمة، وضع معرّفاتها الحقيقية (id) كما هي مكتوبة، بحد أقصى 4 منتجات: {"type": "show_products", "productIds": ["id1"]}.
- استخدم "navigate_category" عندما يطلب العميل الانتقال إلى قسم معين: {"type": "navigate_category", "categoryId": "id"}.
- استخدم "add_to_cart" فقط إذا طلب العميل صراحةً إضافة منتج إلى السلة: {"type": "add_to_cart", "productId": "id", "quantity": 1}.
- لا تخترع معرّفات (id) غير موجودة في القوائم المرفقة. إن لم تكن متأكداً اترك actions فارغة [].
`;

// ==========================================
// 5. مخطّط الرد المهيكل (JSON Schema)
// ==========================================
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: { 
      type: Type.STRING, 
      description: 'الرد النصي المختصر الموجه للعميل بالعربية.' 
    },
    showFaqButton: { 
      type: Type.BOOLEAN, 
      description: 'true إذا كان السؤال عن التوصيل أو الدفع أو طريقة الطلب.' 
    },
    actions: {
      type: Type.ARRAY,
      description: 'أوامر واجهة المتجر المطلوب تنفيذها بعد الرد.',
      items: {
        type: Type.OBJECT,
        properties: {
          type: { 
            type: Type.STRING, 
            enum: ['navigate_category', 'add_to_cart', 'show_products'] 
          },
          categoryId: { type: Type.STRING },
          productId: { type: Type.STRING },
          productIds: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
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

// ==========================================
// 6. الدوال المساعدة (Helpers)
// ==========================================
function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json; charset=utf-8', 
      'Cache-Control': 'no-store', 
      ...extraHeaders 
    },
  });
}

function isSupportTopic(message: string): boolean {
  const text = message.toLowerCase();
  const terms = [
    'توصيل', 'التوصيل', 'الشحن', 'اشحن', 'يوصل', 'التسليم', 'المندوب', 
    'دفع', 'الدفع', 'كاش', 'نقدي', 'كليك', 'cliq', 'تحويل', 
    'طلب', 'الطلب', 'اطلب', 'أطلب', 'تأكيد', 'تاكيد', 
    'اتمام', 'إتمام', 'السلة', 'checkout', 'order', 'delivery', 'payment'
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
      parts: [{ text: item.text.slice(0, MAX_MESSAGE_LENGTH) }] 
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

function buildCatalog(products: CompactProduct[]): string {
  if (products.length === 0) return 'لا توجد منتجات متاحة حالياً.';
  
  return products.map((p) => {
    const stockLabel = p.stock > 0 ? `متوفر:${p.stock}` : 'نفدت الكمية';
    const desc = p.desc ? ` | ${p.desc}` : '';
    return `- id=${p.id} | ${p.name} | ${p.price} د.أ | ${p.category || 'غير مصنّف'} | ${stockLabel}${desc}`;
  }).join('\n');
}

function buildCategoryList(categories: CompactCategory[]): string {
  if (categories.length === 0) return 'لا توجد أقسام.';
  return categories.map((c) => `- id=${c.id} | ${c.name}`).join('\n');
}

function sanitizeActions(raw: unknown, products: CompactProduct[], categories: CompactCategory[]): ChatAction[] {
  if (!Array.isArray(raw)) return [];
  
  const productMap = new Map(products.map((p) => [p.id, p]));
  const categoryIds = new Set<string>(['all', ...categories.map((c) => c.id)]);
  const actions: ChatAction[] = [];

  for (const entry of raw) {
    if (actions.length >= MAX_ACTIONS) break;
    if (!entry || typeof entry !== 'object') continue;
    
    const action = entry as Record<string, unknown>;
    const type = String(action.type || '');

    // 1. أمر الانتقال لقسم
    if (type === 'navigate_category') {
      const categoryId = typeof action.categoryId === 'string' ? action.categoryId.trim() : '';
      if (!categoryId || !categoryIds.has(categoryId)) continue;
      actions.push({ type: 'navigate_category', categoryId });
      continue;
    }

    // 2. أمر إضافة للسلة
    if (type === 'add_to_cart') {
      const productId = typeof action.productId === 'string' ? action.productId.trim() : '';
      const product = productMap.get(productId);
      if (!product || product.stock <= 0) continue;
      
      const requested = Math.floor(Number(action.quantity) || 1);
      const quantity = Math.min(Math.max(1, requested), product.stock);
      actions.push({ type: 'add_to_cart', productId: product.id, quantity });
      continue;
    }

    // 3. أمر عرض منتجات
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

// ==========================================
// 7. الكاش (Caching)
// ==========================================
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
    // تجاهل فشل الكاش
  }
}

// ==========================================
// 8. التحقق من الردود المهيكلة (JSON Parser)
// ==========================================
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
    
    // التحقق الصارم من بنية الرد
    if (typeof parsed.answer !== 'string' || !parsed.answer.trim()) return null;
    if (parsed.showFaqButton !== undefined && typeof parsed.showFaqButton !== 'boolean') return null;
    if (!Array.isArray(parsed.actions)) return null;

    return {
      answer: parsed.answer.trim(),
      showFaqButton: Boolean(parsed.showFaqButton),
      actions: parsed.actions,
    };
  } catch {
    return null;
  }
}

// ==========================================
// 9. دوال الاتصال بمزودي الذكاء الاصطناعي
// ==========================================
function sleep(ms: number) { 
  return new Promise((resolve) => setTimeout(resolve, ms)); 
}

function thinkingConfigFor(model: string): { thinkingConfig?: { thinkingLevel?: ThinkingLevel; thinkingBudget?: number } } {
  const name = model.toLowerCase();
  if (name.startsWith('gemini-3')) {
    return { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } };
  }
  if (name.startsWith('gemini-2.5')) {
    return { thinkingConfig: { thinkingBudget: 0 } };
  }
  return {};
}

async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  systemInstruction: string,
  extraHeaders: Record<string, string> = {},
  timeoutMs: number = AI_TIMEOUT_MS
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const messages = [
    { role: 'system', content: systemInstruction },
    ...contents.map((item) => ({
      role: item.role === 'model' ? 'assistant' : 'user',
      content: item.parts.map((p) => p.text).join('\n'),
    })),
  ];

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${apiKey}`, 
        'Content-Type': 'application/json', 
        ...extraHeaders 
      },
      body: JSON.stringify({ 
        model, 
        messages, 
        temperature: 0.3, 
        max_tokens: MAX_OUTPUT_TOKENS, 
        response_format: { type: 'json_object' } 
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`API error (${response.status}): ${await response.text()}`);
    }
    
    const data = (await response.json()) as any;
    const text = data?.choices?.[0]?.message?.content;
    
    if (!text) throw new Error('Provider returned empty content');
    return String(text);
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ==========================================
// 10. نظام التبديل الاحتياطي (Failover)
// ==========================================
async function generateParsedResponse(
  requestStartTime: number,
  ai: GoogleGenAI | null,
  models: string[],
  contents: any[],
  systemInstruction: string,
  groq?: { apiKey: string; model: string },
  openRouter?: { apiKey: string; model: string }
): Promise<{ answer: string; showFaqButton: boolean; actions: unknown }> {
  
  let lastError: any = null;
  const timeLeft = () => GLOBAL_TIMEOUT_MS - (Date.now() - requestStartTime);

  // 1. محاولة Gemini
  if (ai) {
    for (const model of models) {
      if (timeLeft() <= 2000) break;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.min(AI_TIMEOUT_MS, timeLeft()));

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
            ...thinkingConfigFor(model) 
          },
        });
        clearTimeout(timer);

        if (String((result?.candidates?.[0] as any)?.finishReason) === 'MAX_TOKENS') {
          throw new Error('MAX_TOKENS');
        }
        
        const parsed = parseModelJson(String(result?.text || ''));
        if (parsed) return parsed;
        
        console.warn(`Gemini ${model} returned invalid JSON. Moving to next...`);
        lastError = new Error('Invalid JSON from Gemini');
      } catch (err: any) {
        clearTimeout(timer);
        lastError = err;
        
        const message = String(err?.message || '').toLowerCase();
        const status = err?.status || err?.code;
        const isOverloaded = status === 503 || status === 429 || message.includes('503') || message.includes('429') || message.includes('unavailable') || message.includes('high demand');

        if (isOverloaded && timeLeft() > 3000) {
          console.warn(`Gemini ${model} overloaded. Retrying once...`);
          await sleep(1000);
          try {
            const retryController = new AbortController();
            const retryTimer = setTimeout(() => retryController.abort(), Math.min(AI_TIMEOUT_MS, timeLeft()));
            
            const result2 = await ai.models.generateContent({
              model, 
              contents,
              config: { 
                systemInstruction, 
                temperature: 0.3, 
                maxOutputTokens: MAX_OUTPUT_TOKENS, 
                responseMimeType: 'application/json', 
                responseSchema: RESPONSE_SCHEMA as any, 
                abortSignal: retryController.signal, 
                ...thinkingConfigFor(model) 
              },
            });
            clearTimeout(retryTimer);
            
            const parsed2 = parseModelJson(String(result2?.text || ''));
            if (parsed2) return parsed2;
          } catch { 
            console.warn(`Retry for ${model} failed.`); 
          }
        } else {
          console.warn(`Gemini ${model} failed (${status}): ${message}. Moving to next...`);
        }
      }
    }
  }

  // 2. محاولة Groq
  if (groq?.apiKey && timeLeft() > 2000) {
    console.warn('Falling back to Groq...');
    try {
      const raw = await callOpenAICompatible(
        'https://api.groq.com/openai/v1/chat/completions', 
        groq.apiKey, 
        groq.model, 
        contents, 
        systemInstruction, 
        {}, 
        Math.min(AI_TIMEOUT_MS, timeLeft())
      );
      const parsed = parseModelJson(raw);
      if (parsed) return parsed;
      console.warn('Groq returned invalid JSON. Moving to OpenRouter...');
    } catch (err) {
      console.error('Groq failed:', err);
      lastError = err;
    }
  }

  // 3. محاولة OpenRouter
  if (openRouter?.apiKey && timeLeft() > 2000) {
    console.warn('Falling back to OpenRouter...');
    try {
      const raw = await callOpenAICompatible(
        'https://openrouter.ai/api/v1/chat/completions', 
        openRouter.apiKey, 
        openRouter.model, 
        contents, 
        systemInstruction, 
        { 'HTTP-Referer': 'https://dukan962.com', 'X-Title': 'Dukan962 Nashmi Assistant' }, 
        Math.min(AI_TIMEOUT_MS, timeLeft())
      );
      const parsed = parseModelJson(raw);
      if (parsed) return parsed;
      console.warn('OpenRouter returned invalid JSON.');
    } catch (err) {
      console.error('OpenRouter failed:', err);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI providers failed or returned invalid JSON.');
}

// ==========================================
// 11. معالج الطلبات الرئيسي (Worker Fetch Handler)
// ==========================================
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestStartTime = Date.now();
    const url = new URL(request.url);
    
    if (url.pathname !== '/api/chat') {
      return env.ASSETS.fetch(request);
    }
    
    if (request.method !== 'POST') {
      return json({ success: false, message: 'طريقة الطلب غير مدعومة.' }, 405);
    }

    try {
      // 1. حماية من الإغراق (Rate Limiting)
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (env.CHAT_LIMITER) {
        const limit = await env.CHAT_LIMITER.limit({ key: ip });
        if (!limit.success) {
          return json({ success: false, message: 'وصلت إلى الحد المؤقت للرسائل. حاول بعد دقيقة.' }, 429);
        }
      }

      // 2. استقبال البيانات والتحقق منها
      const body = await request.json() as { message?: unknown; history?: unknown; products?: unknown; categories?: unknown };
      
      if (typeof body.message !== 'string') {
        return json({ success: false, message: 'اكتب سؤالك أولاً.' }, 400);
      }

      const message = body.message.trim();
      if (!message || message.length > MAX_MESSAGE_LENGTH) {
        return json({ success: false, message: `الرسالة يجب أن تكون بين حرف و${MAX_MESSAGE_LENGTH} حرف.` }, 400);
      }

      // 3. التحقق من مفاتيح الـ API
      const geminiApiKey = (env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
      const groqApiKey = (env.GROQ_API_KEY || '').trim().replace(/^["']|["']$/g, '');
      const openRouterApiKey = (env.OPENROUTER_API_KEY || '').trim().replace(/^["']|["']$/g, '');

      if (!geminiApiKey && !groqApiKey && !openRouterApiKey) {
        return json({ success: false, message: 'المساعد غير مُعدّ حالياً.' }, 503);
      }

      // 4. تجهيز البيانات
      const history = cleanHistory(body.history);
      const products = cleanProducts(body.products);
      const categories = cleanCategories(body.categories);
      const catalog = buildCatalog(products);
      const categoryList = buildCategoryList(categories);

      // 5. الكاش (فقط للرسالة الأولى بدون تاريخ محادثة)
      const cacheable = history.length === 0;
      const cacheKey = cacheable ? await hashKey(`${message.toLowerCase()}\n${catalog}\n${categoryList}`) : '';

      if (cacheable) {
        const cached = await readCache(cacheKey);
        if (cached) {
          return json(
            { success: true, answer: cached.answer, actions: cached.actions, showFaqButton: cached.showFaqButton, cached: true }, 
            200, 
            { 'X-Nashmi-Cache': 'HIT' }
          );
        }
      }

      // 6. تجهيز مزودي الذكاء الاصطناعي
      const baseUrl = (env.GEMINI_BASE_URL || '').trim();
      const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey, ...(baseUrl ? { httpOptions: { baseUrl } } : {}) }) : null;

      const augmentedMessage = `[الأقسام المتاحة في المتجر]:\n${categoryList}\n\n[قائمة المنتجات المتاحة حالياً في المتجر]:\n${catalog}\n\n[سؤال الزبون]:\n${message}`;

      const customModel = (env.GEMINI_MODEL || '').trim();
      const primary = customModel || PRIMARY_MODEL;
      const modelsToTry = [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)];
      const groqModel = (env.GROQ_MODEL || '').trim() || DEFAULT_GROQ_MODEL;
      const openRouterModel = (env.OPENROUTER_MODEL || '').trim() || DEFAULT_OPENROUTER_MODEL;

      // 7. تنفيذ الطلب عبر نظام التبديل الاحتياطي
      const parsed = await generateParsedResponse(
        requestStartTime,
        ai, modelsToTry,
        [...history, { role: 'user', parts: [{ text: augmentedMessage }] }],
        STORE_KNOWLEDGE,
        groqApiKey ? { apiKey: groqApiKey, model: groqModel } : undefined,
        openRouterApiKey ? { apiKey: openRouterApiKey, model: openRouterModel } : undefined
      );

      // 8. التحقق النهائي من الأوامر وإرجاع الرد
      const payload: ChatPayload = {
        answer: parsed.answer,
        showFaqButton: parsed.showFaqButton || isSupportTopic(message),
        actions: sanitizeActions(parsed.actions, products, categories),
      };

      if (cacheable) {
        await writeCache(cacheKey, payload);
      }

      return json(
        { success: true, answer: payload.answer, actions: payload.actions, showFaqButton: payload.showFaqButton, cached: false }, 
        200, 
        { 'X-Nashmi-Cache': 'MISS' }
      );

    } catch (error: any) {
      console.error('Dukan962 AI Final Error:', error?.message || error);
      
      if (error?.name === 'AbortError' || Date.now() - requestStartTime >= GLOBAL_TIMEOUT_MS) {
        return json({ success: false, message: 'المساعد استغرق وقتاً طويلاً للرد، جرب تبعت سؤالك مرة ثانية 🙏' }, 504);
      }
      
      return json({ success: false, message: 'المساعد نشمي مشغول شوي حالياً، جرب تبعت رسالتك كمان ثواني 🙏' }, 503);
    }
  },
};
