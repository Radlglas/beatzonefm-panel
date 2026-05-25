import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpt0otoJpzX_svBPFDdJqAubfLIm3Nf4o",
  authDomain: "beatzone-fm.firebaseapp.com",
  projectId: "beatzone-fm",
  storageBucket: "beatzone-fm.firebasestorage.app",
  messagingSenderId: "932395949542",
  appId: "1:932395949542:web:9c00b89f38fb79cf4a8a27",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
