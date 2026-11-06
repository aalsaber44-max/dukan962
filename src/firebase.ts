// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // هذا السطر هو المسؤول عن السحابة (الحفظ)
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

// تشغيل Firebase
const app = initializeApp(firebaseConfig);

// تصدير قاعدة البيانات (db) عشان نستخدمها في لوحة التحكم
export const db = getFirestore(app);

// تصدير المصادقة (لو احتجتها بعدين)
export const auth = getAuth(app);
