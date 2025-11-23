import { auth, db, storage, signOut, collection, getDocs, addDoc, query, where, updateDoc, doc, ref, uploadBytes, getDownloadURL, onAuthStateChanged, getDoc } from './firebase-config.js';
import { showToast } from './utils.js';

let currentUser = null;

// Cek Login
onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = 'login.html'; return; }
    currentUser = user;
    try {
        const uDoc = await getDoc(doc(db, "users", user.uid));
        if(uDoc.exists()) document.getElementById('userName').innerText = uDoc.data().nama;
    } catch(e) { console.error(e); }
    
    loadJadwal();
    loadPesananSaya();
});

// 1. LOAD JADWAL
async function loadJadwal() {
    const con = document.getElementById('jadwalContainer'); 
    con.innerHTML = '';
    try {
        const snap = await getDocs(collection(db, "jadwal"));
        if (snap.empty) { 
            con.innerHTML = '<div class="col-span-full text-center py-10 text-slate-400 border border-dashed border-slate-300 rounded-lg">Tidak ada jadwal tersedia.</div>'; 
            return; 
        }

        snap.forEach(d => {
            const dt = d.data();
            let k = ''; 
            for(let i=1; i<=10; i++) {
                const taken = dt.kursi_terisi && dt.kursi_terisi.includes(i);
                k += `<button onclick="${taken?'':`pesan('${d.id}',${i},${dt.harga})`}" class="h-8 rounded text-xs font-bold border ${taken?'bg-slate-100 text-slate-300 cursor-not-allowed border-slate-100':'bg-white text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white transition'}">${i}</button>`;
            }
            con.innerHTML += `<div class="card p-5"><div class="flex justify-between mb-3"><div><h3 class="font-bold text-lg text-slate-800">${dt.tujuan}</h3><p class="text-xs text-slate-500">${dt.tanggal} • ${dt.jam}</p></div><div class="text-right"><span class="font-bold text-blue-600 text-lg">Rp${dt.harga.toLocaleString()}</span></div></div><div class="bg-slate-50 p-3 rounded-lg border border-slate-100"><p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Pilih Kursi</p><div class="grid grid-cols-5 gap-2">${k}</div></div></div>`;
        });
    } catch(e) { console.error("Error Load Jadwal:", e); }
}

// 2. BOOKING
window.pesan = async (jid, no, hrg) => {
    if(!confirm(`Pesan kursi no ${no}?`)) return;
    try {
        await addDoc(collection(db, "pemesanan"), {
            user_id: currentUser.uid, nama_penumpang: document.getElementById('userName').innerText,
            jadwal_id: jid, kursi: no, total_harga: hrg, status: "Menunggu Pembayaran", bukti_url: null, tanggal_pesan: new Date().toISOString()
        });
        const jRef = doc(db, "jadwal", jid); 
        const jSnap = await getDoc(jRef);
        if(jSnap.exists()) {
            const cur = jSnap.data().kursi_terisi || []; cur.push(no);
            await updateDoc(jRef, { kursi_terisi: cur });
        }
        showToast("Booking berhasil! Silakan upload bukti.", "success"); 
        loadJadwal(); loadPesananSaya();
    } catch(e) { showToast(e.message, "error"); }
};

// 3. LOAD PESANAN
async function loadPesananSaya() {
    const con = document.getElementById('pesananContainer'); con.innerHTML = '';
    try {
        const snap = await getDocs(query(collection(db, "pemesanan"), where("user_id", "==", currentUser.uid)));
        
        if (snap.empty) { con.innerHTML = '<div class="text-center text-slate-400 py-6 bg-white rounded-lg border border-slate-200">Belum ada pesanan.</div>'; return; }

        snap.forEach(d => {
            const dt = d.data();
            let status = '', btn = '';

            if (dt.status === 'Menunggu Pembayaran') {
                status = '<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Belum Bayar</span>';
                btn = `<button onclick="bukaModal('${d.id}')" class="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition">Upload Bukti</button>`;
            } else if (dt.status === 'Menunggu Verifikasi') {
                status = '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Verifikasi</span>';
                btn = `<div class="mt-3 text-center text-xs text-slate-400 bg-slate-50 py-2 rounded border">Sedang dicek admin...</div>`;
            } else {
                status = '<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Lunas</span>';
                btn = `<button onclick="window.print()" class="w-full mt-3 border border-green-600 text-green-600 py-2 rounded-lg text-sm font-bold hover:bg-green-50 transition">Cetak Tiket</button>`;
            }

            con.innerHTML += `
                <div class="card p-4 flex flex-col md:flex-row gap-4 justify-between items-center ticket-card">
                    <div class="flex items-center gap-4 w-full">
                        <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 border">${dt.kursi}</div>
                        <div>
                            <div class="mb-1">${status}</div>
                            <p class="font-bold text-slate-800">Rp${dt.total_harga.toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="w-full md:w-40">${btn}</div>
                </div>`;
        });
    } catch(e) { console.error("Error Pesanan:", e); }
}

// ===================================================
// 4. LOGIC UPLOAD FIX (DENGAN NAMA FILE AMAN)
// ===================================================
window.bukaModal = (id) => {
    document.getElementById('idPesananUpload').value = id;
    document.getElementById('modalUpload').classList.remove('hidden');
    // Reset Input
    document.getElementById('fileBukti').value = "";
    if(document.getElementById('fileNamePreview')) {
        document.getElementById('fileNamePreview').classList.add('hidden');
    }
};

window.closeModal = () => document.getElementById('modalUpload').classList.add('hidden');

// Tampilkan nama file
const fileInput = document.getElementById('fileBukti');
if(fileInput) {
    fileInput.addEventListener('change', function() {
        if(this.files[0]) {
            const nameText = document.getElementById('fileNameText');
            const previewDiv = document.getElementById('fileNamePreview');
            
            if(nameText) nameText.innerText = this.files[0].name;
            if(previewDiv) previewDiv.classList.remove('hidden');
        }
    });
}

window.submitBukti = async () => {
    const file = document.getElementById('fileBukti').files[0];
    const id = document.getElementById('idPesananUpload').value;

    if(!file) {
        alert("Pilih foto bukti pembayaran terlebih dahulu!");
        return;
    }

    const btn = document.querySelector('#modalUpload button[onclick="submitBukti()"]');
    const oldHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...'; 
    btn.disabled = true;

    try {
        // PENTING: Bersihkan nama file dari karakter spesial agar tidak error
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const path = `bukti/${id}_${Date.now()}_${cleanName}`;
        
        // Referensi Storage
        const storageRef = ref(storage, path);

        // Upload
        const snap = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snap.ref);

        // Update Database
        await updateDoc(doc(db, "pemesanan", id), {
            bukti_url: url,
            status: "Menunggu Verifikasi"
        });

        alert("BERHASIL! Bukti pembayaran terkirim.");
        closeModal();
        loadPesananSaya();

    } catch(e) {
        console.error("UPLOAD ERROR:", e);
        
        // Pesan Error Spesifik
        if (e.code === 'storage/unauthorized') {
            alert("GAGAL: Izin ditolak. Pastikan Rules Storage sudah 'allow read, write: if true;'");
        } else if (e.code === 'storage/object-not-found' || e.code === 'storage/bucket-not-found') {
            alert("GAGAL: Folder Storage belum dibuat. Buka Firebase Console > Storage > Klik 'Get Started'.");
        } else {
            alert("Error Upload: " + e.message);
        }
    } finally {
        btn.innerHTML = oldHtml; 
        btn.disabled = false;
    }
};

window.logout = () => signOut(auth).then(() => window.location.href = 'login.html');