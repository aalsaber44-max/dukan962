import { GoogleGenAI } from '@google/genai';

interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  ASSETS: any;
  CHAT_LIMITER?: any;
}

// ✅ النماذج الموحدة
const DEFAULT_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.6-flash';
const MAX_MESSAGE_LENGTH = 700;
const MAX_HISTORY_MESSAGES = 6;
const CACHE_TTL_MS = 45_000; // ⏱️ تخزين مؤقت 45 ثانية

const FIREBASE_PROJECT_ID = 'dukan962-3ea92';

// ───────────────────────────────────────────────
// سياسات المتجر الموحدة (مصدر الحقيقة الواحد)
// ───────────────────────────────────────────────
const STORE_POLICIES_TEXT = `
سياسات المتجر المعتمدة (لا تختلف عنها أبداً):
• الشحن والتوصيل: التوصيل عادة من 24 إلى 48 ساعة داخل عمّان؛ من يومين إلى 4 أيام عمل لبقية المحافظات؛ رسوم التوصيل تُحسب حسب المنطقة وقيمة الطلب ويظهر الإجمالي قبل التأكيد.
• الدفع: الدفع النقدي (كاش) عند الاستلام بعد المعاينة؛ أو التحويل عبر تطبيق كليك (CliQ).
• المعاينة: يوفر المتجر معاينة المنتج عند وصول المندوب وقبل الاستلام والدفع؛ يمكن رفض المنتج عند المعاينة قبل الدفع إذا لم يطابق الوصف.
• الاستبدال والاسترجاع: لا يوجد إرجاع بعد الدفع إلا في حالات الضمان؛ يمكن رفض المنتج أثناء المعاينة (قبل الدفع) إذا لم يطابق الوصف.
• الطلب: يضاف المنتج للسلة ثم يُتَمّم الطلب؛ يمكن الطلب عبر الواتساب أيضاً؛ لتتبع الطلب يُستخدم رقم الطلب في صفحة التتبع.
`;

const SYSTEM_INSTRUCTION = `
أنت "نشمي"، مساعد خدمة العملاء والبائع الرسمي لمتجر Dukan962 في الأردن.
أجب بالعربية الواضحة واللطيفة، ويمكنك استخدام اللهجة الأردنية البسيطة والمحببة.
${STORE_POLICIES_TEXT}

قواعد صارمة جداً (يجب اتباعها حرفياً):
1. أجب باختصار، من جملة إلى ثلاث جمل كحد أقصى.
2. لا تخترع رسومًا أو مواعيد أو سياسات أو منتجات أو أسعار أو خصومات غير موجودة في بيانات الخادم.
3. لا تقل إنك أنشأت طلبًا أو أكدت دفعًا؛ أنت لا تنفذ هذه العمليات.
4. إذا سألك العميل عن سعر أو توفر منتج، يجب أن تبحث عن اسم المنتج في "قائمة المنتجات" المرفقة من الخادم.
5. إذا وجدت المنتج، أجب بهذه الصيغة: "سعر [اسم المنتج] هو [السعر] دينار." ثم اذكر الألوان والمقاسات المتاحة والمخزون بوضوح.
6. إذا لم تجد المنتج في القائمة، قل بوضوح: "هذا المنتج مش متوفر حالياً، جرب تصفح المتجر لأحدث القطع." لا تحاول تخمين سعره أبداً.
7. عند السؤال عن التوصيل أو الدفع أو تأكيد الطلب، أجب بإيجاز ووجّه العميل صراحةً للضغط على زر «الأسئلة الشائعة وطريقة الطلب».
8. لا تطلب كلمات مرور أو أرقام بطاقات.
9. إذا سأل عن لون أو مقاس محدد، تحقق من توفره في بيانات المنتج ولا تختلق خيارات غير موجودة.
`;

// ───────────────────────────────────────────────
// Firestore REST Helpers
// ───────────────────────────────────────────────

interface FirestoreDocument {
  name: string;
  fields: Record<string, unknown>;
  createTime?: string;
  updateTime?: string;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

let productsCache: CachedData<Record<string, unknown>[]> | null = null;
let categoriesCache: CachedData<Record<string, unknown>[]> | null = null;

async function fetchFirestoreCollection(collectionId: string): Promise<FirestoreDocument[]> {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collectionId}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Firestore read failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { documents?: FirestoreDocument[] };
  return json.documents || [];
}

function firestoreValueToJS(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== 'object') return value;
  const v = value as Record<string, unknown>;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('arrayValue' in v && (v.arrayValue as Record<string, unknown>)?.values) {
    return ((v.arrayValue as Record<string, unknown>).values as unknown[]).map(firestoreValueToJS);
  }
  if ('mapValue' in v && (v.mapValue as Record<string, unknown>)?.fields) {
    return firestoreMapToJS((v.mapValue as Record<string, unknown>).fields as Record<string, unknown>);
  }
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  return value;
}

function firestoreMapToJS(fields: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(fields)) {
    result[key] = firestoreValueToJS(val);
  }
  return result;
}

function parseFirestoreDoc(doc: FirestoreDocument): Record<string, unknown> {
  const id = doc.name.split('/').pop() || '';
  const data = firestoreMapToJS(doc.fields);
  return { id, ...data };
}

async function getProducts(): Promise<Record<string, unknown>[]> {
  const now = Date.now();
  if (productsCache && now - productsCache.timestamp < CACHE_TTL_MS) {
    return productsCache.data;
  }
  const docs = await fetchFirestoreCollection('products');
  const products = docs.map(parseFirestoreDoc).filter((p) => p.isActive !== false);
  productsCache = { data: products, timestamp: now };
  return products;
}

async function getCategories(): Promise<Record<string, unknown>[]> {
  const now = Date.now();
  if (categoriesCache && now - categoriesCache.timestamp < CACHE_TTL_MS) {
    return categoriesCache.data;
  }
  const docs = await fetchFirestoreCollection('categories');
  const categories = docs.map(parseFirestoreDoc).filter((c) => c.isActive !== false);
  categoriesCache = { data: categories, timestamp: now };
  return categories;
}

// ───────────────────────────────────────────────
// Product Formatting & Search
// ───────────────────────────────────────────────

function formatProductForAI(product: Record<string, unknown>): string {
  const name = String(product.name || 'منتج بدون اسم');
  const basePrice = Number(product.basePrice || 0);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;
  const categoryId = String(product.categoryId || 'غير محدد');
  const description = String(product.description || '');
  const stock = product.stock !== undefined ? Number(product.stock) : 'غير محدد';
  const dimensions = String(product.dimensions || '');
  const sku = String(product.sku || '');

  const colors = Array.isArray(product.colors)
    ? product.colors
        .map((c: unknown) => {
          const col = c as Record<string, unknown>;
          const cName = String(col.name || '');
          const cPrice = col.price !== undefined ? Number(col.price) : basePrice;
          const cOriginal = col.originalPrice ? Number(col.originalPrice) : undefined;
          return `${cName}${cPrice !== basePrice ? ` (${cPrice} د.أ)` : ''}${cOriginal ? ` [قبل الخصم: ${cOriginal} د.أ]` : ''}`;
        })
        .join('، ')
    : 'لا يوجد';

  const attributes = Array.isArray(product.attributes)
    ? product.attributes
        .map((a: unknown) => {
          const attr = a as Record<string, unknown>;
          return `${attr.name || ''}: ${(attr.options as string[] || []).join(' / ')}`;
        })
        .join('؛ ')
    : '';

  let text = `- ${name} | القسم: ${categoryId} | السعر: ${basePrice} د.أ`;
  if (originalPrice && originalPrice > basePrice) {
    text += ` | قبل الخصم: ${originalPrice} د.أ`;
  }
  text += ` | المخزون: ${stock}`;
  if (colors && colors !== 'لا يوجد') text += ` | الألوان: ${colors}`;
  if (attributes) text += ` | المقاسات/الخيارات: ${attributes}`;
  if (dimensions) text += ` | المقاسات: ${dimensions}`;
  if (sku) text += ` | SKU: ${sku}`;
  if (description) text += ` | الوصف: ${description.slice(0, 120)}`;
  return text;
}

function buildProductContext(products: Record<string, unknown>[], searchTerm?: string): string {
  if (!products.length) return 'لا توجد منتجات متاحة حالياً.';

  if (searchTerm && searchTerm.trim().length > 0) {
    const term = searchTerm.trim().toLowerCase();
    const matches = products.filter((p) => {
      const pname = String(p.name || '').toLowerCase();
      const pdesc = String(p.description || '').toLowerCase();
      const pcat = String(p.categoryId || '').toLowerCase();
      return pname.includes(term) || pdesc.includes(term) || pcat.includes(term);
    });

    if (matches.length === 0) return `لا توجد منتجات مطابقة لـ "${searchTerm}".`;
    if (matches.length <= 5) {
      return `المنتجات المطابقة لـ "${searchTerm}":\n${matches.map(formatProductForAI).join('\n')}`;
    }
    return `تم العثور على ${matches.length} منتج مطابق. أهم النتائج:\n${matches.slice(0, 5).map(formatProductForAI).join('\n')}`;
  }

  return `قائمة المنتجات المتاحة (${products.length} منتج):\n${products.map(formatProductForAI).join('\n')}`;
}

// ───────────────────────────────────────────────
// Response Helpers
// ───────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
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

// ───────────────────────────────────────────────
// Worker Export
// ───────────────────────────────────────────────

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

      const body = await request.json() as { message?: unknown; history?: unknown };

      if (typeof body.message !== 'string') {
        return json({ success: false, message: 'اكتب سؤالك أولاً.' }, 400);
      }

      const message = body.message.trim();
      if (!message || message.length > MAX_MESSAGE_LENGTH) {
        return json({ success: false, message: `الرسالة يجب أن تكون بين حرف و${MAX_MESSAGE_LENGTH} حرف.` }, 400);
      }

      if (!env.GEMINI_API_KEY) {
        return json({ success: false, message: 'المساعد غير مُعدّ (المفتاح مفقود).' }, 503);
      }

      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      const history = cleanHistory(body.history);

      // 🔒 جلب المنتجات من الخادم (Server-Side Source of Truth)
      let productContext: string;
      try {
        const [products, categories] = await Promise.all([getProducts(), getCategories()]);
        // بناء سياق ذكي: إذا كان السؤال يبدو بحث عن منتج، نبحث ونُرسل النتائج المطابقة فقط
        const seemsLikeProductQuery = /(سعر|كم|متوف|منتج|قطع|طاولة|سرير|كنب|صالون|خشب|عطر|حذاء)/.test(message);
        productContext = buildProductContext(products, seemsLikeProductQuery ? message : undefined);
        // إرفاق أسماء الأقسام كمرجع
        if (categories.length) {
          productContext += `\n\nالأقسام المتاحة: ${categories.map((c) => String(c.name || c.id)).join('، ')}.`;
        }
      } catch (firestoreErr: unknown) {
        console.error('Firestore fetch error:', (firestoreErr as Error)?.message || firestoreErr);
        productContext = 'تعذر جلب قائمة المنتجات من الخادم حالياً.';
      }

      const augmentedMessage = `
[قائمة المنتجات المتاحة في المتجر]:
${productContext}

[سؤال الزبون]:
${message}
      `;

      const primaryModel = env.GEMINI_MODEL || DEFAULT_MODEL;
      let result: { text?: string } | null = null;

      // ✅ إعدادات النموذج الموحدة مع thinkingConfig حسب توثيق Google SDK
      const generationConfig = {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        maxOutputTokens: 800,
        thinkingConfig: { thinkingLevel: 'LOW' as const },
      } as const;

      try {
        result = (await ai.models.generateContent({
          model: primaryModel,
          contents: [
            ...history,
            { role: 'user', parts: [{ text: augmentedMessage }] },
          ],
          config: generationConfig as unknown as any,
        })) as { text?: string };
      } catch (err: unknown) {
        console.warn(`Primary model (${primaryModel}) failed, switching to fallback (${FALLBACK_MODEL})...`);
        result = (await ai.models.generateContent({
          model: FALLBACK_MODEL,
          contents: [
            ...history,
            { role: 'user', parts: [{ text: augmentedMessage }] },
          ],
          config: generationConfig as unknown as any,
        })) as { text?: string };
      }

      const answer = result?.text?.trim();
      if (!answer) {
        return json({ success: false, message: 'لم أتمكن من إنشاء إجابة. حاول مجدداً.' }, 503);
      }

      return json({
        success: true,
        answer,
        showFaqButton: isSupportTopic(message),
      });
    } catch (error: unknown) {
      console.error('Dukan962 AI Error:', (error as Error)?.message || error);
      if ((error as { status?: number }).status === 429) {
        return json({ success: false, message: 'المساعد مشغول جداً حالياً، حاول بعد قليل.' }, 429);
      }
      // ❌ أزلنا debug_error من الرد للعميل — يبقى فقط في السيرفر
      return json({ success: false, message: 'حدث خطأ مؤقت في الاتصال بالمساعد. جرب تاني شوي يا صديقي.' }, 503);
    }
  },
};
