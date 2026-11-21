import { GoogleGenAI } from '@google/genai';

interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  GEMINI_BASE_URL?: string;
  ASSETS: any;
  CHAT_LIMITER?: any;
}

// قائمة النماذج مرتبة حسب الأولوية والاستقرار (إذا تعطل الأول ينتقل تلقائياً للتالي)
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
];

const MAX_MESSAGE_LENGTH = 700;
const MAX_HISTORY_MESSAGES = 6;
const AI_TIMEOUT_MS = 12000; // 12 ثانية لكل محاولة حتى لا يتجاوز إجمالي الانتظار الحدود

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
`;

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// دالة استدعاء Gemini مع إعادة المحاولة والتبديل التلقائي بين النماذج عند الضغط (503)
async function generateWithFallback(
  ai: GoogleGenAI,
  models: string[],
  contents: any[],
  systemInstruction: string
) {
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
            maxOutputTokens: 250,
            abortSignal: controller.signal,
          },
        });
        clearTimeout(timer);
        return result;
      } catch (err: any) {
        clearTimeout(timer);
        lastError = err;

        const msg = String(err?.message || '');
        const isOverloaded =
          err?.status === 503 ||
          err?.status === 429 ||
          msg.includes('503') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('high demand');

        console.warn(`Model ${model} (attempt ${attempt}) failed:`, msg);

        // إذا كان الخطأ ضغط خوادم، انتظر قليلاً وأعد المحاولة أو انتقل للنموذج التالي
        if (isOverloaded) {
          if (attempt < 2) await sleep(600);
          continue;
        }

        // إذا كان الخطأ ليس ضغط خوادم (مثل خطأ في المفتاح)، اخرج فوراً
        throw err;
      }
    }
  }

  throw lastError;
}

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

      const body = await request.json() as { message?: unknown; history?: unknown; productContext?: string };

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

      const baseUrl = (env.GEMINI_BASE_URL || '').trim();
      const ai = new GoogleGenAI({
        apiKey,
        ...(baseUrl ? { httpOptions: { baseUrl } } : {}),
      });

      const history = cleanHistory(body.history);
      const productContext = body.productContext || 'لا توجد منتجات متاحة.';

      const augmentedMessage = `
[قائمة المنتجات المتاحة حالياً في المتجر]:
${productContext}

[سؤال الزبون]:
${message}
      `;

      // إذا حددت نموذجاً في إعدادات Cloudflare يتم وضعه أولاً ثم النماذج الاحتياطية
      const customModel = (env.GEMINI_MODEL || '').trim();
      const modelsToTry = customModel
        ? [customModel, ...FALLBACK_MODELS.filter((m) => m !== customModel)]
        : FALLBACK_MODELS;

      const result = await generateWithFallback(
        ai,
        modelsToTry,
        [...history, { role: 'user', parts: [{ text: augmentedMessage }] }],
        STORE_KNOWLEDGE
      );

      const answer = result?.text?.trim();
      if (!answer) {
        return json({ success: false, message: 'عذراً، لم أتمكن من صياغة رد واضح. جرب تسألني مرة ثانية.' }, 503);
      }

      return json({
        success: true,
        answer,
        showFaqButton: isSupportTopic(message),
      });

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
