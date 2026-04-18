import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyCnD2zOCZtMHDC1Ht7htIWRQ-0JsGKh34k",
  authDomain: "neratix-student.firebaseapp.com",
  projectId: "neratix-student",
  storageBucket: "neratix-student.firebasestorage.app",
  messagingSenderId: "483325040308",
  appId: "1:483325040308:web:f8bf26e62f604419a769e1"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
