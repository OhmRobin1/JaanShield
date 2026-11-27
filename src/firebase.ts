import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "thinking-airway-t01dl",
  appId: "1:984732787044:web:b970a90fdb9b10d39a5a71",
  apiKey: "AIzaSyDFw7FIj8YCGllc6ofNXP12swKndUVJHdE",
  authDomain: "thinking-airway-t01dl.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-jaanbandcoremkiv-70021240-1a25-48a5-9641-54bb740133e2",
  storageBucket: "thinking-airway-t01dl.firebasestorage.app",
  messagingSenderId: "984732787044"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const signIn = () => signInWithPopup(auth, new GoogleAuthProvider());
