import { db, auth, firebaseConfig, signOut, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, setDoc, onAuthStateChanged, getDoc } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signOut as signOutSecondary } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { showToast } from './utils.js';

onAuthStateChanged(auth, async (user) => {
    if (!user) window.location.href = 'login.html';
    const uDoc = await getDoc(doc(db, "users", user.uid));
    if(uDoc.exists()) document.getElementById('adminName').innerText = uDoc.data().nama;
    loadSupirDropdown(); loadDaftarSopir(); loadDaftarPenumpang(); loadJadwal(); loadTransaksi(); loadLaporan();
});

// 1. TAMBAH SOPIR
document.getElementById('formTambahSopir').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button'); const oldText = btn.innerText;
    btn.innerText = "Memproses..."; btn.disabled = true;
    try {
        const secApp = initializeApp(firebaseConfig, "SecondaryApp");
        const secAuth = getAuth(secApp);
        const cred = await createUserWithEmailAndPassword(secAuth, document.getElementById('regEmailSopir').value, document.getElementById('regPassSopir').value);
        await setDoc(doc(db, "users", cred.user.uid), {
            nama: document.getElementById('regNamaSopir').value,
            email: document.getElementById('regEmailSopir').value,
            noHP: document.getElementById('regHpSopir').value,
            role: "sopir", createdAt: new Date()
        });
        await signOutSecondary(secAuth);
        showToast("Sopir berhasil ditambahkan", "success");
        document.getElementById('formTambahSopir').reset();
        document.getElementById('formSopirArea').classList.add('hidden');
        loadDaftarSopir(); loadSupirDropdown();
    } catch(e) { showToast(e.message, "error"); } finally { btn.innerText = oldText; btn.disabled = false; }
});

// 2. DATA SOPIR
async function loadDaftarSopir() {
    const tbody = document.getElementById('listSopirTable'); tbody.innerHTML = '';
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "sopir")));
    snap.forEach(d => {
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
window.openEditSopir = (id, nama, hp, email) => { document.getElementById('editIdSopir').value = id; document.getElementById('editNamaSopir').value = nama; document.getElementById('editHpSopir').value = hp; document.getElementById('editEmailSopir').value = email; document.getElementById('modalEditSopir').classList.remove('hidden'); };
window.saveEditSopir = async () => {
    try { await updateDoc(doc(db, "users", document.getElementById('editIdSopir').value), { nama: document.getElementById('editNamaSopir').value, noHP: document.getElementById('editHpSopir').value, email: document.getElementById('editEmailSopir').value }); showToast("Data sopir diupdate", "success"); document.getElementById('modalEditSopir').classList.add('hidden'); loadDaftarSopir(); } catch(e) { showToast("Gagal update", "error"); }
};

// 3. DATA PENUMPANG
async function loadDaftarPenumpang() {
    const tbody = document.getElementById('listPenumpangTable'); tbody.innerHTML = '';
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "penumpang")));
    snap.forEach(d => {
        const dt = d.data();
        const tgl = dt.createdAt ? new Date(dt.createdAt.seconds * 1000).toLocaleDateString() : '-';
        tbody.innerHTML += `<tr class="border-b hover:bg-slate-50"><td class="p-3 font-bold text-slate-700">${dt.nama}</td><td class="p-3">${dt.noHP}</td><td class="p-3 text-slate-500">${dt.email}</td><td class="p-3 text-xs text-slate-400">${tgl}</td></tr>`;
    });
}

// 4. JADWAL
async function loadJadwal() {
    const div = document.getElementById('listJadwal'); div.innerHTML = '';
    const snap = await getDocs(collection(db, "jadwal"));
    snap.forEach(d => {
        const dt = d.data(); const terisi = dt.kursi_terisi ? dt.kursi_terisi.length : 0;
        div.innerHTML += `<div class="card p-4 flex justify-between items-center bg-white border border-slate-200 mb-3 rounded-lg shadow-sm"><div><h4 class="font-bold text-slate-800">${dt.tujuan}</h4><p class="text-xs text-slate-500">${dt.tanggal} | ${dt.jam}</p><p class="text-[10px] text-slate-400 mt-1">Terisi: ${terisi}/10</p></div><button onclick="hapusJadwal('${d.id}')" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button></div>`;
    });
}
document.getElementById('formJadwal').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await addDoc(collection(db, "jadwal"), {
            tujuan: document.getElementById('tujuan').value, tanggal: document.getElementById('tanggal').value, jam: document.getElementById('jam').value, harga: parseInt(document.getElementById('harga').value), supir_id: document.getElementById('pilihSupir').value, kursi_max: 10, kursi_terisi: []
        }); showToast("Jadwal disimpan", "success"); loadJadwal(); document.getElementById('formJadwal').reset();
    } catch(e){ showToast(e.message, "error"); }
});
async function loadSupirDropdown() {
    const s = document.getElementById('pilihSupir'); s.innerHTML = '<option value="">Pilih...</option>';
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "sopir")));
    snap.forEach(d => s.innerHTML += `<option value="${d.id}">${d.data().nama}</option>`);
}

// 5. TRANSAKSI (VERIFIKASI) - TAMPILAN KARTU (CARD) YANG MUDAH DIPAHAMI
async function loadTransaksi() {
    const container = document.getElementById('gridTransaksi'); 
    container.innerHTML = '';
    
    const snap = await getDocs(query(collection(db, "pemesanan"), where("status", "==", "Menunggu Verifikasi")));
    
    if(snap.empty) { 
        container.innerHTML = `
            <div class="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <i class="fas fa-check-circle text-4xl text-slate-300 mb-3"></i>
                <p class="text-slate-400 font-medium">Tidak ada pembayaran yang perlu dicek.</p>
            </div>`; 
        return; 
    }

    snap.forEach(d => {
        const dt = d.data();
        
        // Format Waktu
        let waktu = "Baru saja";
        if(dt.tanggal_pesan) {
            const date = new Date(dt.tanggal_pesan);
            waktu = date.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) + ' • ' + date.toLocaleDateString('id-ID', {day:'numeric', month:'short'});
        }

        // Logic Bukti
        let buktiHtml = '';
        if (dt.bukti_url && dt.bukti_url.includes('http')) {
            buktiHtml = `<a href="${dt.bukti_url}" target="_blank" class="w-full text-center block bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition mb-2 border border-blue-100"><i class="fas fa-image"></i> Lihat Bukti Transfer</a>`;
        } else {
            buktiHtml = `<div class="w-full text-center bg-green-50 text-green-700 py-2 rounded-lg text-xs font-bold border border-green-100 mb-2 cursor-default"><i class="fab fa-whatsapp"></i> Konfirmasi via WhatsApp</div>`;
        }

        container.innerHTML += `
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between h-full">
                
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-800 leading-tight">${dt.nama_penumpang}</h4>
                            <p class="text-[11px] text-slate-400 font-medium mt-0.5"><i class="far fa-clock"></i> ${waktu}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-xs text-slate-500 font-medium">Nomor Kursi</span>
                        <span class="text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">#${dt.kursi}</span>
                    </div>
                    <div class="flex justify-between items-center border-t border-slate-200 pt-2 mt-2">
                        <span class="text-xs text-slate-500 font-medium">Total Bayar</span>
                        <span class="text-base font-bold text-green-600">Rp${dt.total_harga.toLocaleString()}</span>
                    </div>
                </div>

                <div class="mt-auto">
                    ${buktiHtml}
                    <button onclick="verifikasi('${d.id}')" class="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 hover:shadow-md transition flex items-center justify-center gap-2">
                        <i class="fas fa-check"></i> Terima Pembayaran
                    </button>
                </div>
            </div>`;
    });
}

// 6. LAPORAN KEUANGAN
async function loadLaporan() {
    const tbody = document.getElementById('tabelLaporan'); 
    const totalEl = document.getElementById('totalPendapatan');
    tbody.innerHTML = '';
    
    const snap = await getDocs(query(collection(db, "pemesanan"), where("status", "==", "Lunas")));
    let total = 0;
    
    if(snap.empty) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400">Belum ada pemasukan.</td></tr>';
        totalEl.innerText = "Rp0";
        return;
    }

    const orders = [];
    snap.forEach(d => orders.push(d.data()));

    for (const dt of orders) {
        total += parseInt(dt.total_harga);
        let tglPesan = dt.tanggal_pesan ? new Date(dt.tanggal_pesan).toLocaleDateString() : '-';
        
        let namaRute = "-";
        if(dt.jadwal_id) {
            try {
                const jSnap = await getDoc(doc(db, "jadwal", dt.jadwal_id));
                if(jSnap.exists()) namaRute = jSnap.data().tujuan;
            } catch(e) {}
        }

        tbody.innerHTML += `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3 text-slate-500 text-xs">${tglPesan}</td>
                <td class="p-3 font-bold text-slate-700">${dt.nama_penumpang}</td>
                <td class="p-3 text-slate-700">${namaRute}</td>
                <td class="p-3 text-xs text-slate-500 font-mono">${dt.kursi}</td>
                <td class="p-3 text-right font-bold text-green-600">+ Rp${parseInt(dt.total_harga).toLocaleString()}</td>
            </tr>`;
    }
    totalEl.innerText = `Rp${total.toLocaleString()}`;
}

window.hapusUser = async (id) => { if(confirm("Hapus?")) { await deleteDoc(doc(db,"users",id)); loadDaftarSopir(); }};
window.hapusJadwal = async (id) => { if(confirm("Hapus?")) { await deleteDoc(doc(db,"jadwal",id)); loadJadwal(); }};
window.verifikasi = async (id) => { if(confirm("Yakin terima pembayaran ini?")) { await updateDoc(doc(db,"pemesanan",id), {status:"Lunas"}); showToast("Lunas", "success"); loadTransaksi(); loadLaporan(); }};
window.logout = () => signOut(auth).then(() => window.location.href = 'login.html');