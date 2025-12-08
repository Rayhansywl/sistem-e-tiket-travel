export function showToast(msg, type = "info") {
  const c = document.getElementById("toast-container") || createC();
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  const icon =
    type === "success"
      ? '<i class="fas fa-check-circle text-green-500 text-xl"></i>'
      : type === "error"
      ? '<i class="fas fa-times-circle text-red-500 text-xl"></i>'
      : '<i class="fas fa-info-circle text-blue-500 text-xl"></i>';
  t.innerHTML = `${icon}<div><h4 class="font-bold text-xs uppercase text-slate-400">${type}</h4><p class="text-sm font-medium text-slate-700">${formatMsg(
    msg
  )}</p></div>`;
  c.appendChild(t);
  setTimeout(() => t.classList.add("show"), 50);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 400);
  }, 4000);
}
function createC() {
  const d = document.createElement("div");
  d.id = "toast-container";
  document.body.appendChild(d);
  return d;
}
function formatMsg(m) {
  if (!m) return "Error";
  if (m.includes("auth/wrong-password")) return "Password salah.";
  if (m.includes("auth/user-not-found")) return "Akun tidak ditemukan.";
  if (m.includes("auth/email-already-in-use")) return "Email sudah terdaftar.";
  return m.replace("Firebase: ", "");
}
