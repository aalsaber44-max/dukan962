// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjTUAL-AwdEh2WiE7B6TP2TsAuNj0ypRM",
  authDomain: "dukan962-3ea92.firebaseapp.com",
  projectId: "dukan962-3ea92",
  storageBucket: "dukan962-3ea92.firebasestorage.app",
  messagingSenderId: "912187800588",
  appId: "1:912187800588:web:705f739536dfe1c9a08229",
  measurementId: "G-5MDVDGWW7W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
