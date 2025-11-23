import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAYeYldoly0QuLBCA9jlGX03fI8JKd1zIc",
  authDomain: "e-tiket-travel-caa47.firebaseapp.com",
  projectId: "e-tiket-travel-caa47",
  storageBucket: "e-tiket-travel-caa47.firebasestorage.app",
  messagingSenderId: "3137242374",
  appId: "1:3137242374:web:8d6034cadb314dc4ea4a87",
  measurementId: "G-HBPVBQX5TZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, firebaseConfig, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, ref, uploadBytes, getDownloadURL };