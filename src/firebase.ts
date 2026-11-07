// src/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, getDocFromServer, doc } from "firebase/firestore"; // هذا السطر هو المسؤول عن السحابة (الحفظ)
import { getAuth } from "firebase/auth"; // هذا للدخول (لو حبيت تستخدمه لاحقاً)

// إعدادات مشروعك الخاصة
const firebaseConfig = {
  apiKey: "AIzaSyAjTUAL-AwdEh2WiE7B6TP2TsAuNj0ypRM",
  authDomain: "dukan962-3ea92.firebaseapp.com",
  projectId: "dukan962-3ea92",
  storageBucket: "dukan962-3ea92.firebasestorage.app",
  messagingSenderId: "912187800588",
  appId: "1:912187800588:web:705f739536dfe1c9a08229",
  measurementId: "G-5MDVDGWW7W"
};

// تشغيل Firebase مع حارس ضد التهيئة المكررة
// (قد تُستدعى هذه الوحدة أكثر من مرة مع HMR أو أكواد طرف ثالث، وإعادة initializeApp ترمي خطأ)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// تصدير قاعدة البيانات (db) عشان نستخدمها في لوحة التحكم
export const db = getFirestore(app);

// تصدير المصادقة (لو احتجتها بعدين)
export const auth = getAuth(app);

/**
 * اختبار سريع للاتصال بقاعدة Firestore من المتصفح.
 * يقرأ مستنداً خفيفاً من السيرفر (وليس الكاش) ويعيد true/false،
 * ويسجّل النتيجة في Console لتسهيل تتبع أخطاء الاتصال.
 */
export const testFirestoreConnection = async (): Promise<boolean> => {
  try {
    // قراءة مباشرة من السيرفر: نجاح الطلب نفسه دليل اتصال، حتى لو لم يكن المستند موجوداً
    await getDocFromServer(doc(db, "__health__", "ping")).catch((err) => {
      // "المستند غير موجود" يعني أن الاتصال نفسه ناجح
      if (err && typeof err === "object" && (err as { code?: string }).code === "unavailable") {
        throw err;
      }
    });
    console.info("[Dukan962] الاتصال بقاعدة Firestore يعمل بنجاح ✓");
    return true;
  } catch (error) {
    console.error("[Dukan962] فشل الاتصال بقاعدة Firestore:", error);
    return false;
  }
};
