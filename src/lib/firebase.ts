import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCbhK8RdG4qek-jwi7yTRtDPfLF7bbO_nc",
  authDomain: "crowncrest-4df0e.firebaseapp.com",
  projectId: "crowncrest-4df0e",
  storageBucket: "crowncrest-4df0e.firebasestorage.app",
  messagingSenderId: "957318976282",
  appId: "1:957318976282:web:a0251aab0599d09c7212a3",
  measurementId: "G-R4NVKD5131"
};

// 1. Initialize Firebase (Singleton Pattern)
// Prevents re-initialization errors in Next.js hot-reloading
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Auth (Required for Phone Login)
const firebaseAuth = getAuth(app);

// 3. Initialize Analytics (Client-Side Only)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, firebaseAuth, analytics };