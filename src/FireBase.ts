import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBOQmLgKSaGgX6lKVZsWkKK887kmJUkblo",
  authDomain: "nodecraftv2.firebaseapp.com",
  projectId: "nodecraftv2",
  storageBucket: "nodecraftv2.firebasestorage.app",
  messagingSenderId: "527178901504",
  appId: "1:527178901504:web:17851f5951f5c5e2a210e5",
  measurementId: "G-V1LDHW7ER1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const auth = getAuth(app);