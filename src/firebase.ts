
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

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

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
    const hint =
      code === "unavailable"
        ? "تعذّر الوصول لسيرفر Firestore — تحقّق من الاتصال بالإنترنت أو من حظر المتصفح/الامتدادات (AdBlock, Privacy extensions)."
        : code === "permission-denied"
          ? "صلاحيات القراءة مرفوضة في Firestore Rules — افتح القراءة للمسار __health__ أو استخدم مستنداً مسموحاً بقراءته لجميع الزوار."
          : code === "failed-precondition"
            ? "قاعدة البيانات غير مهيأة بعد، أو تحتاج خطوات إعداد إضافية من لوحة Firebase."
            : "خطأ غير متوقع أثناء اختبار الاتصال.";

    console.error(`[Dukan962] فشل اختبار Firestore (${code}): ${hint}`, error);
    return false;
  }
};
