import { auth, db, signOut, collection, getDocs, addDoc, query, where, updateDoc, doc, onAuthStateChanged, getDoc } from './firebase-config.js';
import { showToast } from './utils.js';

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = 'login.html'; return; }
    currentUser = user;
    try {
        const uDoc = await getDoc(doc(db, "users", user.uid));
        if(uDoc.exists()) document.getElementById('userName').innerText = uDoc.data().nama;
    } catch(e) { console.error(e); }
    loadJadwal(); loadPesananSaya();
});

// 1. LOAD JADWAL
async function loadJadwal() {
    const con = document.getElementById('jadwalContainer'); con.innerHTML = '';
    try {
        const snap = await getDocs(collection(db, "jadwal"));
        if (snap.empty) { con.innerHTML = '<div class="col-span-full text-center py-10 text-slate-400 border border-dashed border-slate-300 rounded-lg">Tidak ada jadwal tersedia.</div>'; return; }
        snap.forEach(d => {
            const dt = d.data();
            let k = ''; 
            for(let i=1; i<=10; i++) {
                const taken = dt.kursi_terisi && dt.kursi_terisi.includes(i);
                k += `<button onclick="${taken?'':`pesan('${d.id}',${i},${dt.harga})`}" class="h-8 rounded text-xs font-bold border ${taken?'bg-slate-100 text-slate-300 cursor-not-allowed border-slate-100':'bg-white text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white transition'}">${i}</button>`;
            }
            con.innerHTML += `<div class="card p-5"><div class="flex justify-between mb-3"><div><h3 class="font-bold text-lg text-slate-800">${dt.tujuan}</h3><p class="text-xs text-slate-500">${dt.tanggal} • ${dt.jam}</p></div><div class="text-right"><span class="font-bold text-blue-600 text-lg">Rp${dt.harga.toLocaleString()}</span></div></div><div class="bg-slate-50 p-3 rounded-lg border border-slate-100"><p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Pilih Kursi</p><div class="grid grid-cols-5 gap-2">${k}</div></div></div>`;
        });
    } catch(e) { console.error(e); }
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
        showToast("Booking berhasil!", "success"); loadJadwal(); loadPesananSaya();
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
            let statusBadge = '', btn = '';

            if (dt.status === 'Menunggu Pembayaran') {
                statusBadge = `<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Menunggu Pembayaran</span>`;
                btn = `<button onclick="bukaModal('${d.id}')" class="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition">Konfirmasi Bayar</button>`;
            } else if (dt.status === 'Menunggu Verifikasi') {
                statusBadge = `<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Menunggu Verifikasi</span>`;
                btn = `<div class="mt-3 text-center text-xs text-slate-400 bg-slate-50 py-2 rounded border">Menunggu Admin...</div>`;
            } else if (dt.status === 'Lunas') {
                statusBadge = `<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Lunas</span>`;
                btn = `<button onclick="cetakTiket('${d.id}', '${dt.jadwal_id}', '${dt.nama_penumpang}', '${dt.kursi}', '${dt.total_harga}')" class="w-full mt-3 border border-green-600 text-green-600 py-2 rounded-lg text-sm font-bold hover:bg-green-50 transition flex items-center justify-center gap-2"><i class="fas fa-file-pdf"></i> Download PDF</button>`;
            } else if (dt.status === 'Dibatalkan') {
                statusBadge = `<span class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Dibatalkan</span>`;
                btn = `<div class="mt-3 text-center text-xs text-red-400 bg-red-50 py-2 rounded border">Dibatalkan</div>`;
            }

            con.innerHTML += `
                <div class="card p-4 flex flex-col md:flex-row gap-4 justify-between items-center ticket-card">
                    <div class="flex items-center gap-4 w-full">
                        <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 border">${dt.kursi}</div>
                        <div>
                            <div class="mb-1">${statusBadge}</div>
                            <p class="font-bold text-slate-800">Rp${dt.total_harga.toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="w-full md:w-40">${btn}</div>
                </div>`;
        });
    } catch(e) { console.error(e); }
}

// 4. LOGIC DOWNLOAD PDF (RAPI & DATA SOPIR LENGKAP)
window.cetakTiket = async (idPesanan, idJadwal, nama, kursi, harga) => {
    const { jsPDF } = window.jspdf;
    const docPdf = new jsPDF();

    let tujuan = "-", tanggal = "-", jam = "-", namaSopir = "-", hpSopir = "-";

    try {
        const jSnap = await getDoc(doc(db, "jadwal", idJadwal));
        if(jSnap.exists()) {
            const jd = jSnap.data();
            tujuan = jd.tujuan; tanggal = jd.tanggal; jam = jd.jam;
            
            if(jd.supir_id) {
                const sSnap = await getDoc(doc(db, "users", jd.supir_id));
                if(sSnap.exists()) {
                    namaSopir = sSnap.data().nama;
                    hpSopir = sSnap.data().noHP || "-"; 
                }
            }
        }
    } catch(e) { console.error("Gagal ambil detail", e); }

    // --- DESAIN PDF ---
    docPdf.setFillColor(37, 99, 235);
    docPdf.rect(0, 0, 210, 40, "F");
    
    docPdf.setFont("helvetica", "bold");
    docPdf.setFontSize(24);
    docPdf.setTextColor(255, 255, 255);
    docPdf.text("E-TIKET TRAVEL", 105, 25, null, null, "center");

    docPdf.setTextColor(0, 0, 0);
    docPdf.setFontSize(12);
    
    // Info Pesanan
    docPdf.setDrawColor(200, 200, 200);
    docPdf.setFillColor(248, 250, 252);
    docPdf.roundedRect(15, 50, 180, 30, 3, 3, "FD");
    
    docPdf.setFontSize(10); docPdf.setTextColor(100);
    docPdf.text("ID PESANAN", 25, 62); docPdf.text("STATUS", 150, 62);
    
    docPdf.setFontSize(14); docPdf.setTextColor(0);
    docPdf.text(`#${idPesanan.substring(0,8).toUpperCase()}`, 25, 70);
    docPdf.setTextColor(22, 163, 74); docPdf.text("LUNAS", 150, 70);

    // Detail
    const startY = 100; const gap = 12;
    const labels = ["Nama Penumpang", "Tujuan", "Tanggal", "Jam", "Nomor Kursi", "Nama Sopir", "No HP Sopir"];
    const values = [nama, tujuan, tanggal, `${jam} WIB`, kursi, namaSopir, hpSopir];

    docPdf.setTextColor(0); docPdf.setFontSize(12);
    labels.forEach((label, i) => {
        docPdf.setFont("helvetica", "normal"); docPdf.setTextColor(100);
        docPdf.text(label, 25, startY + (gap * i));
        docPdf.setFont("helvetica", "bold"); docPdf.setTextColor(0);
        docPdf.text(`:  ${values[i]}`, 80, startY + (gap * i));
    });

    docPdf.setDrawColor(220); docPdf.line(15, startY + (gap * 8), 195, startY + (gap * 8));
    docPdf.setFontSize(16); docPdf.setTextColor(37, 99, 235);
    docPdf.text(`Total: Rp${parseInt(harga).toLocaleString()}`, 195, startY + (gap * 9), null, null, "right");
    
    docPdf.setFontSize(9); docPdf.setTextColor(150);
    docPdf.text("Simpan tiket ini dan tunjukkan kepada sopir.", 105, 280, null, null, "center");

    docPdf.save(`Tiket-${nama}.pdf`);
};

window.bukaModal = (id) => { document.getElementById('idPesananUpload').value = id; document.getElementById('modalUpload').classList.remove('hidden'); };
window.closeModal = () => { document.getElementById('modalUpload').classList.add('hidden'); };

window.sendWA = async () => {
    const id = document.getElementById('idPesananUpload').value;
    const nomorWA = "6283172262686"; 
    const btn = document.querySelector('button[onclick="sendWA()"]');
    btn.innerHTML = "Memproses..."; btn.disabled = true;
    try {
        await updateDoc(doc(db, "pemesanan", id), { status: "Menunggu Verifikasi", bukti_url: "Via WhatsApp" });
        const text = `Halo Admin, saya sudah transfer ID: ${id}. Mohon verifikasi.`;
        window.open(`https://wa.me/${nomorWA}?text=${encodeURIComponent(text)}`, '_blank');
        closeModal(); loadPesananSaya(); showToast("Terkirim!", "success");
    } catch(e) { alert("Error: " + e.message); } finally { btn.innerHTML = "Konfirmasi via WA"; btn.disabled = false; }
};
window.logout = () => signOut(auth).then(() => window.location.href = 'login.html');