import { auth, db, signOut, collection, query, where, getDocs, onAuthStateChanged, getDoc, doc } from './firebase-config.js';
onAuthStateChanged(auth, async (user) => {
    if(!user) window.location.href='login.html';
    const uDoc = await getDoc(doc(db, "users", user.uid));
    if(uDoc.exists()) document.getElementById('driverName').innerText = uDoc.data().nama;
    loadJadwalSopir(user.uid);
});
async function loadJadwalSopir(uid) {
    const c = document.getElementById('jadwalSopir'); c.innerHTML = '';
    const s = await getDocs(query(collection(db, "jadwal"), where("supir_id", "==", uid)));
    if(s.empty) c.innerHTML = '<p class="col-span-full text-center text-slate-400">Tidak ada tugas.</p>';
    for(const d of s.docs) {
        const dt = d.data();
        const pS = await getDocs(query(collection(db, "pemesanan"), where("jadwal_id", "==", d.id), where("status", "==", "Lunas")));
        let list = ''; pS.forEach(p => { const pd = p.data(); list += `<li class="flex justify-between border-b py-1"><span class="font-bold text-blue-600">Kursi ${pd.kursi}</span> <span>${pd.nama_penumpang}</span></li>`; });
        c.innerHTML += `<div class="card p-5"><h3 class="font-bold text-lg text-slate-800">${dt.tujuan}</h3><p class="text-sm text-slate-500 mb-3">${dt.tanggal} | ${dt.jam}</p><div class="bg-slate-50 p-3 rounded"><p class="text-xs font-bold uppercase mb-2">Manifest (${pS.size})</p><ul class="text-sm space-y-1">${list || '<li class="italic text-slate-400">Belum ada penumpang</li>'}</ul></div></div>`;
    }
}
window.logout = () => signOut(auth).then(() => window.location.href = 'login.html');