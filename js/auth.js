import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  doc,
  setDoc,
  getDoc,
} from "./firebase-config.js";
import { showToast } from "./utils.js";

window.onload = () => {
  document.querySelectorAll("input").forEach((i) => (i.value = ""));
}; // Clear inputs

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    btn.innerText = "Memproses...";
    btn.disabled = true;
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        document.getElementById("email").value,
        document.getElementById("password").value
      );
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (userDoc.exists()) {
        const r = userDoc.data().role;
        showToast("Login Berhasil", "success");
        setTimeout(
          () =>
            (window.location.href =
              r === "admin"
                ? "admin.html"
                : r === "sopir"
                ? "driver.html"
                : "passenger.html"),
          1000
        );
      }
    } catch (e) {
      showToast(e.message, "error");
      btn.innerText = "Masuk";
      btn.disabled = false;
    }
  });
}
const regForm = document.getElementById("registerForm");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    btn.innerText = "Memproses...";
    btn.disabled = true;
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        document.getElementById("email").value,
        document.getElementById("password").value
      );
      await setDoc(doc(db, "users", cred.user.uid), {
        nama: document.getElementById("nama").value,
        email: document.getElementById("email").value,
        noHP: document.getElementById("hp").value,
        role: "penumpang",
        createdAt: new Date(),
      });
      showToast("Registrasi Sukses", "success");
      setTimeout(() => (window.location.href = "login.html"), 1500);
    } catch (e) {
      showToast(e.message, "error");
      btn.innerText = "Daftar";
      btn.disabled = false;
    }
  });
}
