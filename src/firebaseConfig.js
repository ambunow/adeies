// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbv4Wp13-0YujJUnChQOXUblwRzBX5vxk",
  authDomain: "adeies-92384.firebaseapp.com",
  projectId: "adeies-92384",
  storageBucket: "adeies-92384.firebasestorage.app",
  messagingSenderId: "78883318694",
  appId: "1:78883318694:web:717667141b14bf5a727d67"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
