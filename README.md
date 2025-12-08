 Sistem E-Tiket Travel System

**Sistem Pemesanan Tiket Travel Antar Kota Berbasis Web**

Aplikasi web modern untuk mempermudah operasional travel, mulai dari pemesanan tiket oleh penumpang, manajemen jadwal oleh admin, hingga manifest penumpang untuk sopir. 

---

## 🌟 Fitur Utama

Sistem ini dibagi menjadi 3 hak akses (Role) dengan fitur yang saling terintegrasi secara realtime:

### 1. 👤 Panel Penumpang
* **Booking Realtime:** Melihat ketersediaan kursi terkini tanpa perlu refresh halaman.
* **Pilih Kursi:** Visualisasi pemilihan kursi (Kursi terisi otomatis terkunci).
* **E-Tiket PDF:** Download tiket resmi dalam format PDF yang berisi detail perjalanan.
* **Konfirmasi WhatsApp:** Tombol otomatis untuk mengirim bukti pembayaran ke Admin.
* **Status Transaksi:** Memantau status (Menunggu Verifikasi → Lunas).

### 2. 🛡️ Dashboard Admin
* **Manajemen Jadwal:** Membuat jadwal perjalanan (Rute, Jam, Harga) dengan validasi sopir yang tersedia.
* **Manajemen Sopir:** Menambah, mengedit, dan menghapus akun sopir.
* **Verifikasi Pembayaran:** Menerima notifikasi pesanan masuk dan memverifikasi bukti transfer.
* **Laporan Keuangan:** Rekapitulasi pendapatan otomatis dari tiket yang lunas.
* **Cek Penumpang:** Melihat daftar penumpang pada setiap jadwal perjalanan.

### 3. 🚕 Dashboard Sopir
* **Jadwal Tugas:** Hanya melihat jadwal yang ditugaskan kepada dirinya sendiri.
* **Manifest Digital:** Melihat daftar penumpang lengkap (Nama, No Kursi, No HP).
* **Realtime Update:** Data penumpang langsung muncul saat tiket dipesan atau dilunasi.

---

## 🛠️ Teknologi yang Digunakan

* **Frontend:** HTML5, Vanilla JavaScript (ES6 Modules).
* **Styling:** Tailwind CSS (via CDN) & Custom CSS.
* **Backend:** Firebase (Authentication & Firestore Database).
* **Library:**
    * `jsPDF` (Generate Tiket PDF).
    * `FontAwesome` (Ikon Antarmuka).

---

## 📂 Struktur Folder

Kode disusun secara modular agar rapi dan mudah dikembangkan:

```text
e-tiket-travel/
│
├── index.html           # Halaman Landing Page (Beranda)
├── login.html           # Halaman Masuk
├── register.html        # Halaman Pendaftaran
├── admin.html           # Dashboard Admin
├── passenger.html       # Dashboard Penumpang
├── driver.html          # Dashboard Sopir
│
├── css/
│   └── style.css        # Styling tambahan & animasi
│
└── js/
    ├── firebase-config.js  # Konfigurasi koneksi ke Firebase
    ├── admin.js            # Logika Admin (CRUD, Verifikasi)
    ├── passenger.js        # Logika Penumpang (Booking, PDF)
    ├── driver.js           # Logika Sopir (Manifest)
    └── utils.js            # Fungsi bantuan (Notifikasi Toast)
🚀 Cara Menjalankan ProjectIkuti langkah mudah ini untuk mencoba aplikasi di komputer lokal:

1. Clone RepositoriDownload source code ke komputer Anda:Bashgit clone [https://github.com/USERNAME-ANDA/NAMA-REPO.git](https://github.com/USERNAME-ANDA/NAMA-REPO.git)

2. Siapkan FirebaseBuka Firebase Console.Buat project baru.Aktifkan Authentication (Email/Password).Aktifkan Firestore Database (Start in Test Mode).

3. Konfigurasi KodinganBuka file js/firebase-config.js dan ganti bagian firebaseConfig dengan milik Anda:JavaScript
const firebaseConfig = {
    apiKey: "API_KEY_ANDA",
    authDomain: "PROJECT_ID.firebaseapp.com",
    projectId: "PROJECT_ID",
    storageBucket: "PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

4. Jalankan (Wajib Live Server)Karena project ini menggunakan JavaScript Modules (type="module"), Anda tidak bisa menjalankannya hanya dengan klik ganda file HTML.Cara Termudah: Gunakan ekstensi Live Server di VS Code.Klik kanan index.html -> Pilih Open with Live Server.
