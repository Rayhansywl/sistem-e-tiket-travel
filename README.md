Sistem E-Tiket Travel
Sistem Pemesanan Tiket Travel Antar Kota Berbasis Web

Aplikasi web ini dirancang untuk mempermudah proses pemesanan tiket travel, manajemen jadwal, dan manifest penumpang secara digital dan real-time. Dibangun menggunakan Vanilla JavaScript, Tailwind CSS, dan Firebase sebagai backend.

🛠️ Teknologi yang Digunakan
Frontend: HTML5, CSS3

Styling: Tailwind CSS (via CDN)

Logic: Modern JavaScript

Backend & Database: Firebase (Authentication & Firestore)

Fitur Tambahan:

jsPDF (Generate Tiket PDF)

FontAwesome (Ikon UI)

✨ Fitur Unggulan
Aplikasi ini memiliki 3 hak akses pengguna (Role) dengan fitur spesifik masing-masing:

👤 1. Panel Penumpang
Pemesanan Realtime: Melihat jadwal keberangkatan dan ketersediaan kursi secara langsung tanpa refresh halaman.

Visual Seat Selection: Memilih nomor kursi yang diinginkan melalui antarmuka visual (Kursi terisi otomatis tidak bisa dipilih).

Status Transaksi: Memantau status tiket (Menunggu Pembayaran, Menunggu Verifikasi, Lunas).

Konfirmasi WhatsApp: Tombol otomatis untuk mengirim bukti transfer ke Admin via WhatsApp.

Download E-Tiket: Mengunduh tiket resmi dalam format PDF yang berisi detail perjalanan, QR Code (simulasi), dan data penumpang.

Riwayat Pesanan: Melihat daftar riwayat perjalanan yang pernah dipesan.

🛡️ 2. Dashboard Admin
Manajemen Jadwal: Membuat, mengedit, dan menghapus jadwal keberangkatan (Rute, Jam, Harga).

Manajemen Sopir:

Menambah akun sopir baru.

Validasi password & email saat pendaftaran.

Edit dan Hapus data sopir.

Smart Dropdown: Sopir yang sedang bertugas tidak muncul saat pembuatan jadwal baru.

Verifikasi Pembayaran:

Notifikasi realtime saat ada pesanan masuk.

Melihat bukti transfer.

Tombol "Terima Pembayaran" untuk mengubah status menjadi Lunas.

Laporan Keuangan: Rekapitulasi pendapatan dari tiket yang berstatus "Lunas".

Lihat Penumpang: Klik pada kartu jadwal untuk melihat daftar nama penumpang yang terdaftar di jadwal tersebut.

🚕 3. Dashboard Sopir
Jadwal Penugasan: Melihat jadwal perjalanan khusus yang ditugaskan kepada sopir tersebut (Realtime).

Manifest Penumpang Digital: Melihat daftar penumpang lengkap dengan Nama, Nomor Kursi, dan Nomor HP.

Status Lunas/Belum: Mengetahui penumpang mana yang sudah lunas atau belum.

🚀 Cara Menjalankan Project
Ikuti langkah-langkah ini untuk menjalankan project di komputer lokal Anda:

Clone Repositori

Bash

git clone https://github.com/username-anda/nama-repo-anda.git
cd nama-repo-anda
Konfigurasi Firebase

Buat project baru di Firebase Console.

Aktifkan Authentication (Email/Password).

Aktifkan Firestore Database.

Buka file js/firebase-config.js dan ganti bagian firebaseConfig dengan kredensial project Anda:

JavaScript

const firebaseConfig = {
    apiKey: "API_KEY_ANDA",
    authDomain: "PROJECT_ID.firebaseapp.com",
    projectId: "PROJECT_ID",
    storageBucket: "PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};
Jalankan Aplikasi

Karena menggunakan ES6 Modules, Anda harus menjalankannya menggunakan local server (tidak bisa klik ganda file html).

Jika menggunakan VS Code, install ekstensi Live Server.

Klik kanan pada index.html -> Open with Live Server.

📂 Struktur Folder
Plaintext

/
├── index.html           # Landing Page (Beranda)
├── login.html           # Halaman Login
├── register.html        # Halaman Registrasi Penumpang
├── admin.html           # Dashboard Admin
├── passenger.html       # Dashboard Penumpang
├── driver.html          # Dashboard Sopir
│
├── css/
│   └── style.css        # Custom CSS & Animasi
│
└── js/
    ├── firebase-config.js  # Konfigurasi & Export Fungsi Firebase
    ├── admin.js            # Logika Dashboard Admin
    ├── passenger.js        # Logika Dashboard Penumpang
    ├── driver.js           # Logika Dashboard Sopir
    └── utils.js            # Fungsi utilitas (Toast Notifikasi)
