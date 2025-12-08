import {
  db,
  auth,
  firebaseConfig,
  signOut,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
  onAuthStateChanged,
  getDoc,
  onSnapshot,
  getDocs,
} from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut as signOutSecondary,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { showToast } from "./utils.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) window.location.href = "login.html";
  const uDoc = await getDoc(doc(db, "users", user.uid));
  if (uDoc.exists())
    document.getElementById("adminName").innerText = uDoc.data().nama;

  listenSupirDropdown();
  listenDaftarSopir();
  listenDaftarPenumpang();
  listenJadwal();
  listenTransaksi();
  listenLaporan();
});

function formatTanggalIndo(tglStr) {
  if (!tglStr) return "-";
  const date = new Date(tglStr);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// 1. TAMBAH SOPIR (VALIDASI & NOTIFIKASI JELAS)
document
  .getElementById("formTambahSopir")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    const oldText = btn.innerText;

    // Validasi Password
    const password = document.getElementById("regPassSopir").value;
    if (password.length < 6) {
      showToast(
        "Password terlalu pendek. Mohon gunakan minimal 6 karakter.",
        "error"
      );
      return;
    }

    btn.innerText = "Memproses...";
    btn.disabled = true;
    try {
      const secApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secAuth = getAuth(secApp);
      const cred = await createUserWithEmailAndPassword(
        secAuth,
        document.getElementById("regEmailSopir").value,
        password
      );
      await setDoc(doc(db, "users", cred.user.uid), {
        nama: document.getElementById("regNamaSopir").value,
        email: document.getElementById("regEmailSopir").value,
        noHP: document.getElementById("regHpSopir").value,
        role: "sopir",
        createdAt: new Date(),
      });
      await signOutSecondary(secAuth);
      showToast("Berhasil! Akun sopir baru telah dibuat.", "success");
      document.getElementById("formTambahSopir").reset();
      document.getElementById("formSopirArea").classList.add("hidden");
    } catch (e) {
      // Terjemahan Error Firebase ke Bahasa Indonesia
      let pesan = "Gagal membuat akun.";
      if (e.code === "auth/email-already-in-use")
        pesan = "Email ini sudah terdaftar. Silakan gunakan email lain.";
      else if (e.code === "auth/invalid-email")
        pesan = "Format email tidak valid. Cek kembali penulisan email.";
      else if (e.code === "auth/weak-password")
        pesan = "Password terlalu lemah.";
      else pesan = "Terjadi kesalahan: " + e.message;

      showToast(pesan, "error");
    } finally {
      btn.innerText = oldText;
      btn.disabled = false;
    }
  });

// 2. LISTEN DATA SOPIR
function listenDaftarSopir() {
  const tbody = document.getElementById("listSopirTable");
  onSnapshot(
    query(collection(db, "users"), where("role", "==", "sopir")),
    (snap) => {
      tbody.innerHTML = "";
      snap.forEach((d) => {
        const dt = d.data();
        tbody.innerHTML += `
                <tr class="border-b hover:bg-slate-50 transition">
                    <td class="p-4 font-bold text-slate-700">${dt.nama}</td>
                    <td class="p-4">${dt.noHP}</td>
                    <td class="p-4 text-slate-500">${dt.email}</td>
                    <td class="p-4 text-right">
                        <button onclick="openEditSopir('${d.id}', '${dt.nama}', '${dt.noHP}', '${dt.email}')" class="text-blue-600 bg-blue-50 p-2 rounded mr-2 hover:bg-blue-100"><i class="fas fa-edit"></i></button>
                        <button onclick="hapusUser('${d.id}')" class="text-red-500 bg-red-50 p-2 rounded hover:bg-red-100"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
      });
    }
  );
}
window.openEditSopir = (id, nama, hp, email) => {
  document.getElementById("editIdSopir").value = id;
  document.getElementById("editNamaSopir").value = nama;
  document.getElementById("editHpSopir").value = hp;
  document.getElementById("editEmailSopir").value = email;
  document.getElementById("modalEditSopir").classList.remove("hidden");
};
window.saveEditSopir = async () => {
  try {
    await updateDoc(
      doc(db, "users", document.getElementById("editIdSopir").value),
      {
        nama: document.getElementById("editNamaSopir").value,
        noHP: document.getElementById("editHpSopir").value,
        email: document.getElementById("editEmailSopir").value,
      }
    );
    showToast("Data sopir berhasil diperbarui.", "success");
    document.getElementById("modalEditSopir").classList.add("hidden");
  } catch (e) {
    showToast("Gagal memperbarui data.", "error");
  }
};

// 3. LISTEN PENUMPANG
function listenDaftarPenumpang() {
  const tbody = document.getElementById("listPenumpangTable");
  onSnapshot(
    query(collection(db, "users"), where("role", "==", "penumpang")),
    (snap) => {
      tbody.innerHTML = "";
      snap.forEach((d) => {
        const dt = d.data();
        const tgl = dt.createdAt
          ? new Date(dt.createdAt.seconds * 1000).toLocaleDateString("id-ID")
          : "-";
        tbody.innerHTML += `<tr class="border-b hover:bg-slate-50"><td class="p-3 font-bold text-slate-700">${dt.nama}</td><td class="p-3">${dt.noHP}</td><td class="p-3 text-slate-500">${dt.email}</td><td class="p-3 text-xs text-slate-400">${tgl}</td></tr>`;
      });
    }
  );
}

// 4. LISTEN JADWAL
function listenJadwal() {
  const div = document.getElementById("listJadwal");
  onSnapshot(collection(db, "jadwal"), (snap) => {
    div.innerHTML = "";
    snap.forEach((d) => {
      const dt = d.data();
      const terisi = dt.kursi_terisi ? dt.kursi_terisi.length : 0;
      const tglIndo = formatTanggalIndo(dt.tanggal);
      div.innerHTML += `
                <div class="card p-4 flex justify-between items-center bg-white border border-slate-200 mb-3 rounded-lg shadow-sm hover:shadow-md transition">
                    <div class="cursor-pointer flex-1" onclick="lihatPenumpang('${d.id}', '${dt.tujuan}', '${tglIndo}')">
                        <h4 class="font-bold text-slate-800 text-lg group-hover:text-blue-600">${dt.tujuan}</h4>
                        <p class="text-xs text-slate-500 mt-1"><i class="far fa-calendar-alt"></i> ${tglIndo} | <i class="far fa-clock"></i> ${dt.jam}</p>
                        <p class="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wide"><i class="fas fa-users"></i> Penumpang: ${terisi}/10 <span class="text-blue-600 underline ml-2">(Lihat)</span></p>
                    </div>
                    <button onclick="hapusJadwal('${d.id}')" class="text-red-500 hover:text-red-700 p-2 ml-4"><i class="fas fa-trash text-lg"></i></button>
                </div>`;
    });
  });
}
window.lihatPenumpang = async (jadwalId, tujuan, tanggal) => {
  document.getElementById("modalLihatPenumpang").classList.remove("hidden");
  document.getElementById(
    "judulJadwalDetail"
  ).innerText = `${tujuan} • ${tanggal}`;
  const tbody = document.getElementById("listPenumpangJadwal");
  tbody.innerHTML =
    '<tr><td colspan="3" class="p-4 text-center">Memuat...</td></tr>';
  try {
    const snap = await getDocs(
      query(collection(db, "pemesanan"), where("jadwal_id", "==", jadwalId))
    );
    tbody.innerHTML = "";
    if (snap.empty) {
      document
        .getElementById("emptyPenumpangJadwal")
        .classList.remove("hidden");
      return;
    } else {
      document.getElementById("emptyPenumpangJadwal").classList.add("hidden");
    }
    snap.forEach((d) => {
      const p = d.data();
      const statusClass =
        p.status === "Lunas"
          ? "text-green-600 bg-green-50 border-green-100"
          : "text-yellow-600 bg-yellow-50 border-yellow-100";
      tbody.innerHTML += `<tr class="border-b hover:bg-slate-50"><td class="p-4 text-center font-bold text-slate-500 bg-slate-50 w-16">${p.kursi}</td><td class="p-4 font-bold text-slate-700">${p.nama_penumpang}</td><td class="p-4"><span class="px-2 py-1 rounded text-xs font-bold border ${statusClass}">${p.status}</span></td></tr>`;
    });
  } catch (e) {
    console.error(e);
  }
};
document.getElementById("formJadwal").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await addDoc(collection(db, "jadwal"), {
      tujuan: document.getElementById("tujuan").value,
      tanggal: document.getElementById("tanggal").value,
      jam: document.getElementById("jam").value,
      harga: parseInt(document.getElementById("harga").value),
      supir_id: document.getElementById("pilihSupir").value,
      kursi_max: 10,
      kursi_terisi: [],
    });
    showToast("Jadwal perjalanan berhasil disimpan.", "success");
    document.getElementById("formJadwal").reset();
  } catch (e) {
    showToast("Gagal menyimpan jadwal.", "error");
  }
});
function listenSupirDropdown() {
  const s = document.getElementById("pilihSupir");
  onSnapshot(collection(db, "jadwal"), (jadwalSnap) => {
    const busyDrivers = [];
    jadwalSnap.forEach((d) => {
      if (d.data().supir_id) busyDrivers.push(d.data().supir_id);
    });
    onSnapshot(
      query(collection(db, "users"), where("role", "==", "sopir")),
      (userSnap) => {
        s.innerHTML = '<option value="">Pilih Sopir...</option>';
        userSnap.forEach((d) => {
          if (!busyDrivers.includes(d.id))
            s.innerHTML += `<option value="${d.id}">${d.data().nama}</option>`;
        });
        if (s.options.length === 1)
          s.innerHTML +=
            "<option disabled>Semua sopir sedang bertugas</option>";
      }
    );
  });
}

// 5. TRANSAKSI
function listenTransaksi() {
  const container = document.getElementById("gridTransaksi");
  onSnapshot(
    query(
      collection(db, "pemesanan"),
      where("status", "==", "Menunggu Verifikasi")
    ),
    (snap) => {
      container.innerHTML = "";
      if (snap.empty) {
        container.innerHTML = `<div class="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50"><i class="fas fa-check-circle text-4xl text-slate-300 mb-3"></i><p class="text-slate-400 font-medium">Tidak ada pembayaran yang perlu dicek.</p></div>`;
        return;
      }
      snap.forEach((d) => {
        const dt = d.data();
        let waktu = "Baru saja";
        if (dt.tanggal_pesan) {
          const date = new Date(dt.tanggal_pesan);
          waktu =
            date.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }) +
            " • " +
            date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
        }
        let buktiHtml =
          dt.bukti_url && dt.bukti_url.includes("http")
            ? `<a href="${dt.bukti_url}" target="_blank" class="w-full text-center block bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition mb-2 border border-blue-100"><i class="fas fa-image"></i> Lihat Bukti Transfer</a>`
            : `<div class="w-full text-center bg-green-50 text-green-700 py-2 rounded-lg text-xs font-bold border border-green-100 mb-2 cursor-default"><i class="fab fa-whatsapp"></i> Konfirmasi via WhatsApp</div>`;
        container.innerHTML += `<div class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between h-full"><div class="flex justify-between items-start mb-4"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200"><i class="fas fa-user"></i></div><div><h4 class="font-bold text-slate-800 leading-tight">${
          dt.nama_penumpang
        }</h4><p class="text-[11px] text-slate-400 font-medium mt-0.5"><i class="far fa-clock"></i> ${waktu}</p></div></div></div><div class="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4"><div class="flex justify-between items-center mb-1"><span class="text-xs text-slate-500 font-medium">Nomor Kursi</span><span class="text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">#${
          dt.kursi
        }</span></div><div class="flex justify-between items-center border-t border-slate-200 pt-2 mt-2"><span class="text-xs text-slate-500 font-medium">Total Bayar</span><span class="text-base font-bold text-green-600">Rp${dt.total_harga.toLocaleString()}</span></div></div><div class="mt-auto">${buktiHtml}<button onclick="verifikasi('${
          d.id
        }')" class="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 hover:shadow-md transition flex items-center justify-center gap-2"><i class="fas fa-check"></i> Terima Pembayaran</button></div></div>`;
      });
    }
  );
}

// 6. LAPORAN
function listenLaporan() {
  const tbody = document.getElementById("tabelLaporan");
  const totalEl = document.getElementById("totalPendapatan");
  onSnapshot(
    query(collection(db, "pemesanan"), where("status", "==", "Lunas")),
    async (snap) => {
      let rows = "";
      let total = 0;
      if (snap.empty) {
        tbody.innerHTML =
          '<tr><td colspan="5" class="p-4 text-center text-slate-400">Belum ada pemasukan.</td></tr>';
        totalEl.innerText = "Rp0";
        return;
      }
      const orders = [];
      snap.forEach((d) => orders.push(d.data()));
      for (const dt of orders) {
        total += parseInt(dt.total_harga);
        let tglPesan = dt.tanggal_pesan
          ? formatTanggalIndo(dt.tanggal_pesan)
          : "-";
        let namaRute = "-";
        if (dt.jadwal_id) {
          try {
            const jSnap = await getDoc(doc(db, "jadwal", dt.jadwal_id));
            if (jSnap.exists()) namaRute = jSnap.data().tujuan;
          } catch (e) {}
        }
        rows += `<tr class="border-b hover:bg-slate-50"><td class="p-3 text-slate-500 text-xs">${tglPesan}</td><td class="p-3 font-bold text-slate-700">${
          dt.nama_penumpang
        }</td><td class="p-3 text-slate-700">${namaRute}</td><td class="p-3 text-xs text-slate-500 font-mono">${
          dt.kursi
        }</td><td class="p-3 text-right font-bold text-green-600">+ Rp${parseInt(
          dt.total_harga
        ).toLocaleString()}</td></tr>`;
      }
      tbody.innerHTML = rows;
      totalEl.innerText = `Rp${total.toLocaleString()}`;
    }
  );
}

window.hapusUser = async (id) => {
  if (confirm("Apakah Anda yakin ingin menghapus data sopir ini?")) {
    await deleteDoc(doc(db, "users", id));
    showToast("Data sopir berhasil dihapus.", "success");
  }
};
window.hapusJadwal = async (id) => {
  if (confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
    await deleteDoc(doc(db, "jadwal", id));
    showToast("Jadwal berhasil dihapus.", "success");
  }
};
window.verifikasi = async (id) => {
  if (confirm("Apakah data pembayaran sudah sesuai?")) {
    await updateDoc(doc(db, "pemesanan", id), { status: "Lunas" });
    showToast("Pembayaran berhasil diverifikasi (Lunas).", "success");
  }
};
window.logout = () =>
  signOut(auth).then(() => (window.location.href = "login.html"));
