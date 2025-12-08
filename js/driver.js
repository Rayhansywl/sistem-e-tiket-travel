import { auth, db, signOut, collection, query, where, doc, getDoc, onAuthStateChanged, onSnapshot } from './firebase-config.js';

let currentUser = null;
onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = 'login.html'; return; }
    currentUser = user;
    const uDoc = await getDoc(doc(db, "users", user.uid));
    if(uDoc.exists()) {
        const d = uDoc.data();
        if(d.role !== 'sopir') { 
            alert("Maaf, akun ini bukan akun sopir. Anda akan dialihkan."); 
            window.location.href='login.html'; 
            return; 
        }
        document.getElementById('driverName').innerText = d.nama;
    }
    listenJadwalSaya();
});

function listenJadwalSaya() {
    const div = document.getElementById('jadwalSopir'); 
    const q = query(collection(db, "jadwal"), where("supir_id", "==", currentUser.uid));
    onSnapshot(q, (snap) => {
        div.innerHTML = '';
        if(snap.empty) { div.innerHTML = '<div class="text-center py-10 bg-white rounded border border-dashed border-slate-300 text-slate-400">Belum ada jadwal penugasan untuk Anda.</div>'; return; }
        snap.forEach(d => {
            const dt = d.data(); const terisi = dt.kursi_terisi ? dt.kursi_terisi.length : 0;
            div.innerHTML += `<div class="card p-5 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4"><div class="w-full"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase mb-1 inline-block">Jadwal Tugas</span><h3 class="font-bold text-xl text-slate-800">${dt.tujuan}</h3><p class="text-sm text-slate-500 mt-1 flex gap-4"><span><i class="far fa-calendar"></i> ${dt.tanggal}</span><span><i class="far fa-clock"></i> ${dt.jam} WIB</span></p><div class="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500"><i class="fas fa-users"></i> Penumpang: ${terisi} / 10</div></div><button onclick="viewManifest('${d.id}', '${dt.tujuan}')" class="w-full md:w-auto bg-slate-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2"><i class="fas fa-list-ul"></i> Lihat Penumpang</button></div>`;
        });
    });
}

let unsubscribeManifest = null;
window.viewManifest = (jadwalId, tujuan) => {
    document.getElementById('modalManifest').classList.remove('hidden'); document.getElementById('manifestTitle').innerText = `Rute: ${tujuan}`;
    const tbody = document.getElementById('listPenumpang'); tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center">Memuat data...</td></tr>';
    const q = query(collection(db, "pemesanan"), where("jadwal_id", "==", jadwalId));
    if(unsubscribeManifest) unsubscribeManifest();
    unsubscribeManifest = onSnapshot(q, async (snap) => {
        tbody.innerHTML = '';
        if(snap.empty) { document.getElementById('emptyState').classList.remove('hidden'); return; } else { document.getElementById('emptyState').classList.add('hidden'); }
        const passengers = []; snap.forEach(d => passengers.push(d.data())); passengers.sort((a,b) => a.kursi - b.kursi);
        for (const p of passengers) {
            let hp = "-"; if(p.user_id) { try { const uSnap = await getDoc(doc(db, "users", p.user_id)); if(uSnap.exists()) hp = uSnap.data().noHP || "-"; } catch(e) {} }
            const statusClass = p.status === 'Lunas' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
            tbody.innerHTML += `<tr class="border-b hover:bg-slate-50"><td class="p-4 font-bold text-slate-800 text-center border-r bg-slate-50 w-16">${p.kursi}</td><td class="p-4 font-bold text-slate-700">${p.nama_penumpang}</td><td class="p-4 font-mono text-slate-600">${hp}</td><td class="p-4"><span class="px-2 py-1 rounded text-xs font-bold ${statusClass}">${p.status}</span></td></tr>`;
        }
    });
};

window.closeModal = () => { document.getElementById('modalManifest').classList.add('hidden'); if(unsubscribeManifest) unsubscribeManifest(); };
window.logout = () => signOut(auth).then(() => window.location.href = 'login.html');