// Import fungsi-fungsi dari SDK Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot, // <--- INI WAJIB ADA UNTUK REALTIME
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Konfigurasi Firebase (Gunakan Config Anda sendiri jika berbeda)
const firebaseConfig = {
  apiKey: "AIzaSyAYeYldoly0QuLBCA9jlGX03fI8JKd1zIc",
  authDomain: "e-tiket-travel-caa47.firebaseapp.com",
  projectId: "e-tiket-travel-caa47",
  storageBucket: "e-tiket-travel-caa47.firebasestorage.app",
  messagingSenderId: "3137242374",
  appId: "1:3137242374:web:8d6034cadb314dc4ea4a87",
  measurementId: "G-HBPVBQX5TZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Export agar bisa dipakai di file lain
export {
  app,
  db,
  auth,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot, // <--- JANGAN LUPA EXPORT INI
  setDoc,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  firebaseConfig,
};
