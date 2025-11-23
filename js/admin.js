import { db, auth, firebaseConfig, signOut, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, setDoc, onAuthStateChanged, getDoc } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signOut as signOutSecondary } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { showToast } from './utils.js';

// Cek Login Admin
onAuthStateChanged(auth, async (user) => {
    if (!user) window.location.href = 'login.html';
    
    // Ambil Nama Admin untuk Header
    const uDoc = await getDoc(doc(db, "users", user.uid));
    if(uDoc.exists()) document.getElementById('adminName').innerText = uDoc.data().nama;

    // Load Semua Data
    loadSupirDropdown();
    loadDaftarSopir();
    loadDaftarPenumpang();
    loadJadwal();
    loadTransaksi();
});

// 1. TAMBAH SOPIR (Logic Secondary App)
document.getElementById('formTambahSopir').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button'); 
    const oldText = btn.innerText;
    btn.innerText = "Memproses..."; btn.disabled = true;

    try {
        // Inisialisasi App Kedua (Agar Admin utama tidak ter-logout saat create user baru)
        const secApp = initializeApp(firebaseConfig, "SecondaryApp");
        const secAuth = getAuth(secApp);
        
        // Buat Akun di Authentication
        const cred = await createUserWithEmailAndPassword(secAuth, document.getElementById('regEmailSopir').value, document.getElementById('regPassSopir').value);
        
        // Simpan Data ke Firestore
        await setDoc(doc(db, "users", cred.user.uid), {
            nama: document.getElementById('regNamaSopir').value,
            email: document.getElementById('regEmailSopir').value,
            noHP: document.getElementById('regHpSopir').value,
            role: "sopir", 
            createdAt: new Date()
        });

        // Logout dari App Kedua & Hapus Instance
        await signOutSecondary(secAuth);
        
        showToast("Sopir berhasil ditambahkan", "success");
        document.getElementById('formTambahSopir').reset();
        document.getElementById('formSopirArea').classList.add('hidden');
        
        loadDaftarSopir(); 
        loadSupirDropdown();

    } catch(e) { 
        showToast(e.message, "error"); 
    } finally { 
        btn.innerText = oldText; 
        btn.disabled = false; 
    }
});

// 2. LOAD & EDIT SOPIR
async function loadDaftarSopir() {
    const tbody = document.getElementById('listSopirTable'); 
    tbody.innerHTML = '';
    
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "sopir")));
    
    if(snap.empty) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400">Belum ada data sopir.</td></tr>';
        return;
    }

    snap.forEach(d => {
        const dt = d.data();
        tbody.innerHTML += `
            <tr class="border-b hover:bg-slate-50 transition">
                <td class="p-4 font-bold text-slate-700">${dt.nama}</td>
                <td class="p-4">${dt.noHP}</td>
                <td class="p-4 text-slate-500">${dt.email}</td>
                <td class="p-4 text-right">
                    <button onclick="openEditSopir('${d.id}', '${dt.nama}', '${dt.noHP}')" class="text-blue-600 bg-blue-50 p-2 rounded mr-2 hover:bg-blue-100 transition" title="Edit"><i class="fas fa-edit"></i></button>
                    <button onclick="hapusUser('${d.id}')" class="text-red-500 bg-red-50 p-2 rounded hover:bg-red-100 transition" title="Hapus"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

// Fungsi Global Edit Sopir
window.openEditSopir = (id, nama, hp) => {
    document.getElementById('editIdSopir').value = id;
    document.getElementById('editNamaSopir').value = nama;
    document.getElementById('editHpSopir').value = hp;
    document.getElementById('modalEditSopir').classList.remove('hidden');
};

window.saveEditSopir = async () => {
    const id = document.getElementById('editIdSopir').value;
    try {
        await updateDoc(doc(db, "users", id), {
            nama: document.getElementById('editNamaSopir').value,
            noHP: document.getElementById('editHpSopir').value
        });
        showToast("Data sopir berhasil diupdate", "success");
        document.getElementById('modalEditSopir').classList.add('hidden');
        loadDaftarSopir();
    } catch(e) { showToast("Gagal update: " + e.message, "error"); }
};

// 3. LOAD PENUMPANG
async function loadDaftarPenumpang() {
    const tbody = document.getElementById('listPenumpangTable'); 
    tbody.innerHTML = '';
    
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "penumpang")));
    
    if(snap.empty) { 
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400">Belum ada data penumpang.</td></tr>'; 
        return; 
    }

    snap.forEach(d => {
        const dt = d.data();
        const tgl = dt.createdAt ? new Date(dt.createdAt.seconds * 1000).toLocaleDateString() : '-';
        tbody.innerHTML += `
            <tr class="border-b hover:bg-slate-50 transition">
                <td class="p-3 font-bold text-slate-700">${dt.nama}</td>
                <td class="p-3">${dt.noHP}</td>
                <td class="p-3 text-slate-500">${dt.email}</td>
                <td class="p-3 text-xs text-slate-400">${tgl}</td>
            </tr>`;
    });
}

// 4. KELOLA JADWAL
async function loadJadwal() {
    const div = document.getElementById('listJadwal'); 
    div.innerHTML = '';
    
    const snap = await getDocs(collection(db, "jadwal"));
    
    if(snap.empty) {
        div.innerHTML = '<div class="text-center text-slate-400 py-4 border border-dashed border-slate-300 rounded-lg">Belum ada jadwal keberangkatan.</div>';
        return;
    }

    snap.forEach(d => {
        const dt = d.data();
        const terisi = dt.kursi_terisi ? dt.kursi_terisi.length : 0;
        
        div.innerHTML += `
            <div class="card p-4 flex flex-col md:flex-row justify-between items-center bg-white border border-slate-200 shadow-sm mb-3">
                <div class="w-full">
                    <div class="flex justify-between items-center">
                        <h4 class="font-bold text-slate-800 text-lg">${dt.tujuan}</h4>
                        <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Rp${dt.harga.toLocaleString()}</span>
                    </div>
                    <p class="text-xs text-slate-500 mb-2 mt-1 flex gap-3">
                        <span><i class="far fa-calendar"></i> ${dt.tanggal}</span>
                        <span><i class="far fa-clock"></i> ${dt.jam}</span>
                    </p>
                    
                    <div class="w-full bg-slate-100 rounded-full h-1.5 mb-1">
                        <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${(terisi/10)*100}%"></div>
                    </div>
                    <p class="text-[10px] text-slate-400 flex justify-between">
                        <span>Terisi: ${terisi}</span>
                        <span>Kapasitas: 10</span>
                    </p>
                </div>
                <div class="ml-4 pl-4 border-l border-slate-100">
                    <button onclick="hapusJadwal('${d.id}')" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
    });
}

document.getElementById('formJadwal').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await addDoc(collection(db, "jadwal"), {
            tujuan: document.getElementById('tujuan').value,
            tanggal: document.getElementById('tanggal').value,
            jam: document.getElementById('jam').value,
            harga: parseInt(document.getElementById('harga').value),
            supir_id: document.getElementById('pilihSupir').value,
            kursi_max: 10, 
            kursi_terisi: []
        });
        showToast("Jadwal berhasil disimpan", "success"); 
        document.getElementById('formJadwal').reset();
        loadJadwal();
    } catch(e){ showToast(e.message, "error"); }
});

async function loadSupirDropdown() {
    const s = document.getElementById('pilihSupir'); 
    s.innerHTML = '<option value="">Pilih Sopir...</option>';
    const snap = await getDocs(query(collection(db, "users"), where("role", "==", "sopir")));
    snap.forEach(d => s.innerHTML += `<option value="${d.id}">${d.data().nama}</option>`);
}

// 5. VERIFIKASI TRANSAKSI
async function loadTransaksi() {
    const t = document.getElementById('tabelTransaksi'); 
    t.innerHTML = '';
    
    const snap = await getDocs(query(collection(db, "pemesanan"), where("status", "==", "Menunggu Verifikasi")));
    
    if(snap.empty) {
        t.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400">Tidak ada transaksi pending.</td></tr>';
        return;
    }

    snap.forEach(d => {
        const dt = d.data();
        t.innerHTML += `
            <tr class="border-b hover:bg-slate-50 transition">
                <td class="p-4 font-bold text-slate-700">${dt.nama_penumpang}</td>
                <td class="p-4 text-sm">Kursi ${dt.kursi}<br><span class="font-bold text-slate-800">Rp${dt.total_harga.toLocaleString()}</span></td>
                <td class="p-4">
                    <a href="${dt.bukti_url}" target="_blank" class="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded text-xs hover:underline hover:bg-blue-100 transition">Lihat Bukti</a>
                </td>
                <td class="p-4"><span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Perlu Cek</span></td>
                <td class="p-4 text-right">
                    <button onclick="verifikasi('${d.id}')" class="text-green-600 font-bold hover:text-green-800 hover:bg-green-50 px-3 py-1 rounded transition">Terima Lunas</button>
                </td>
            </tr>`;
    });
}

// Global Actions
window.hapusUser = async (id) => { 
    if(confirm("Yakin ingin menghapus user ini?")) { 
        await deleteDoc(doc(db,"users",id)); 
        loadDaftarSopir(); 
        loadSupirDropdown();
    }
};

window.hapusJadwal = async (id) => { 
    if(confirm("Yakin ingin menghapus jadwal ini?")) { 
        await deleteDoc(doc(db,"jadwal",id)); 
        loadJadwal(); 
    }
};

window.verifikasi = async (id) => { 
    if(confirm("Konfirmasi pembayaran ini LUNAS?")) { 
        await updateDoc(doc(db,"pemesanan",id), {status:"Lunas"}); 
        showToast("Status diubah menjadi Lunas", "success"); 
        loadTransaksi(); 
    }
};

window.logout = () => signOut(auth).then(() => window.location.href = 'login.html');