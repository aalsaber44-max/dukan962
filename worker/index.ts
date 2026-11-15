import { GoogleGenAI } from '@google/genai';

interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  ASSETS: any;
  CHAT_LIMITER?: any;
}

const DEFAULT_MODEL = 'gemini-3.8-flash'; 
const FALLBACK_MODEL = 'gemini-1.5-flash';
const MAX_MESSAGE_LENGTH = 700;
const MAX_HISTORY_MESSAGES = 6;

// 💡 تم تحديث التعليمات لتشمل دور التاجر والرد على أسئلة المنتجات
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

      // 💡 استلام سياق المنتجات
      const body = await request.json() as { message?: unknown; history?: unknown; productContext?: string };
      
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
      const productContext = body.productContext || 'لا توجد منتجات متاحة.';
      
      // 💡 دمج قائمة المنتجات مع رسالة الزبون لكي يقرأها الـ AI
      const augmentedMessage = `
[قائمة المنتجات المتاحة حالياً في المتجر]:
${productContext}

[سؤال الزبون]:
${message}
      `;

      const primaryModel = env.GEMINI_MODEL || DEFAULT_MODEL;
      let result: any = null;

      try {
        result = await ai.models.generateContent({
          model: primaryModel,
          contents: [
            ...history,
            { role: 'user', parts: [{ text: augmentedMessage }] }, // 💡 إرسال الرسالة المدموجة
          ],
          config: {
            systemInstruction: STORE_KNOWLEDGE,
            temperature: 0.3,
            maxOutputTokens: 250,
          },
        });
      } catch (err: any) {
        console.warn(`Primary model failed, switching to fallback...`);
        result = await ai.models.generateContent({
          model: FALLBACK_MODEL,
          contents: [
            ...history,
            { role: 'user', parts: [{ text: augmentedMessage }] },
          ],
          config: {
            systemInstruction: STORE_KNOWLEDGE,
            temperature: 0.3,
            maxOutputTokens: 250,
          },
        });
      }

      const answer = result.text?.trim();
      if (!answer) {
        return json({ success: false, message: 'لم أتمكن من إنشاء إجابة. حاول مجدداً.' }, 503);
      }

      return json({
        success: true,
        answer,
        showFaqButton: isSupportTopic(message),
      });

    } catch (error: any) {
      console.error('Dukan962 AI Error:', error?.message || error);
      if (error?.status === 429) {
        return json({ success: false, message: 'المساعد مشغول جداً حالياً، حاول بعد قليل.' }, 429);
      }
      return json({ success: false, message: 'حدث خطأ مؤقت في الاتصال بالمساعد.', debug_error: error?.message }, 503);
    }
  },
};
