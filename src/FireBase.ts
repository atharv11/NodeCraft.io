import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBLYqbv86eXuxtj-xu55Tv6eIf_6UIP88A",
  authDomain: "nodecraft-4eb6e.firebaseapp.com",
  databaseURL: "https://nodecraft-4eb6e-default-rtdb.firebaseio.com",
  projectId: "nodecraft-4eb6e",
  storageBucket: "nodecraft-4eb6e.firebasestorage.app",
  messagingSenderId: "631021036908",
  appId: "1:631021036908:web:64b81b7cf31421f5ccff49",
  measurementId: "G-WMKXEZBE1N"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const auth = getAuth(app);