// src/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, getDocFromServer, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAjTUAL-AwdEh2WiE7B6TP2TsAuNj0ypRM",
  authDomain: "dukan962-3ea92.firebaseapp.com",
  projectId: "dukan962-3ea92",
  storageBucket: "dukan962-3ea92.firebasestorage.app",
  messagingSenderId: "912187800588",
  appId: "1:912187800588:web:705f739536dfe1c9a08229",
  measurementId: "G-5MDVDGWW7W"
};

// حارس ضد التهيئة المكررة (HMR / إعادة تحميل)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// قاعدة البيانات + المصادقة
// ملاحظة: لا نُهيّئ Storage هنا لأن فيديوهات الأقسام تُرفع على Cloudinary (مجاناً)
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * اختبار صحة الاتصال بـ Firestore، مع تفريق واضح بين الأخطاء:
 *   - permission-denied : قواعد Firestore Rules ترفض القراءة.
 *   - unavailable       : تعذّر الوصول للسيرفر (شبكة / AdBlock / VPN).
 *   - not-found         : المسار أو قاعدة البيانات نفسها غير موجودة.
 *   - failed-precondition: قاعدة البيانات غير مهيأة بالكامل.
 *   - unauthenticated   : الطلب غير مصادق (القواعد تشترط auth).
 *   - deadline-exceeded : انتهت مهلة الطلب.
 *
 * النتيجة تُسجَّل في Console فقط، ولا تعطّل المتجر.
 */
export const testFirestoreConnection = async (): Promise<boolean> => {
  try {
    const snapshot = await getDocFromServer(doc(db, "__health__", "ping"));
    console.info(
      snapshot.exists()
        ? "[Dukan962] الاتصال بقاعدة Firestore يعمل بنجاح ✓"
        : "[Dukan962] الاتصال بقاعدة Firestore يعمل بنجاح ✓ (مستند الفحص غير موجود، لكن الاتصال والصلاحيات سليمة)"
    );
    return true;
  } catch (error) {
    const code = (error as { code?: string })?.code || "unknown";
    const rawMessage = (error as Error)?.message || "";

    const diagnostics: Record<string, string> = {
      "permission-denied":
        "🔒 [permission-denied] قواعد Firestore Rules ترفض قراءة المسار __health__/ping. " +
        "افتح القراءة لهذا المسار في القواعد (allow read: if true).",
      "unavailable":
        "🌐 [unavailable] تعذّر الوصول إلى سيرفر Firestore. " +
        "تحقّق من اتصال الإنترنت، أو من حظر الطلبات بواسطة AdBlock / VPN / جدار حماية.",
      "not-found":
        "📂 [not-found] المسار أو قاعدة البيانات نفسها غير موجودة. " +
        "تحقّق من projectId في firebaseConfig.",
      "failed-precondition":
        "⚙️ [failed-precondition] قاعدة البيانات غير مهيأة بالكامل. " +
        "أكمل خطوات إعداد Firestore من لوحة Firebase.",
      "unauthenticated":
        "🔑 [unauthenticated] الطلب غير مصادق. " +
        "إن كانت القواعد تشترط auth، سجّل الدخول أولاً.",
      "deadline-exceeded":
        "⏱️ [deadline-exceeded] انتهت مهلة الطلب. الشبكة بطيئة أو محجوبة.",
      "cancelled": "🚫 [cancelled] أُلغي الطلب.",
      "resource-exhausted":
        "📊 [resource-exhausted] تم تجاوز حصة المشروع. راجع Quotas في Firebase.",
      "invalid-argument": "❓ [invalid-argument] معامل غير صالح.",
    };

    const hint = diagnostics[code] ?? `خطأ غير متوقع أثناء اختبار الاتصال (code: ${code}).`;

    console.error(
      `[Dukan962] فشل اختبار Firestore [${code}]: ${hint}`,
      { code, message: rawMessage, error }
    );
    return false;
  }
};
