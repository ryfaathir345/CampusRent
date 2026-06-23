<div align="center">

# 🎓 CampusRent
### Platform Peminjaman & Penyewaan Barang Antar Mahasiswa

CampusRent adalah platform web yang memungkinkan mahasiswa untuk saling **menyewakan dan meminjam barang** seperti laptop, kamera, alat elektronik, peralatan himpunan, dan lainnya — semua di dalam satu ekosistem kampus yang aman dan terverifikasi.

</div>

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Prasyarat Sistem (Wajib Dibaca)](#-prasyarat-sistem-wajib-dibaca)
- [Panduan Instalasi Lengkap (Langkah demi Langkah)](#-panduan-instalasi-lengkap-langkah-demi-langkah)
  - [Tahap 1: Setup Database](#tahap-1-setup-database-mysql)
  - [Tahap 2: Menjalankan Backend API](#tahap-2-menjalankan-backend-api)
  - [Tahap 3: Menjalankan Frontend Website](#tahap-3-menjalankan-frontend-website)
- [Struktur Folder Proyek](#-struktur-folder-proyek)
- [Panduan Penggunaan Singkat](#-panduan-penggunaan-singkat)
- [Troubleshooting (Jika Ada Error)](#-troubleshooting-jika-ada-error)

---

## ✨ Fitur Utama

- 🔐 **Keamanan & Verifikasi**: Login aman, mahasiswa wajib upload KTM yang akan diverifikasi oleh Admin.
- 📦 **Peminjaman Barang**: Upload barang hingga 5 foto per barang, tentukan harga sewa dan stok.
- 💬 **Chat Real-time**: Komunikasi langsung antara peminjam dan penyewa lengkap dengan fitur kirim foto dan lokasi (Shareloc).
- ⚙️ **Transaksi Tersistem**: Mulai dari pengajuan, persetujuan, proses pinjam, hingga pengembalian.
- ⭐ **Sistem Reputasi**: Fitur ulasan (rating & review) beserta "Trust Score" (Skor Kepercayaan) pengguna.
- 🛡️ **Panel Admin Utama**: Admin dapat memverifikasi KTM, menangguhkan akun (suspend), mem-banned barang, hingga mengatur kategori.
- 🌙 **Desain Elegan**: Tampilan UI modern dan responsif dengan dukungan Dark Mode secara menyeluruh.

---

## 🖥️ Prasyarat Sistem (Wajib Dibaca)

Sebelum kamu dapat menjalankan aplikasi CampusRent di komputermu, **pastikan kamu sudah mendownload dan menginstal 2 aplikasi penting di bawah ini:**

### 1. Node.js (Mesin Utama Aplikasi)
Aplikasi ini dibuat menggunakan Node.js. 
- **Download di sini:** [https://nodejs.org/](https://nodejs.org/)
- **Versi:** Pilih versi **LTS** (Long Term Support).
- **Cara Install:** Download file `.msi` (jika Windows) dan install dengan klik `Next` terus hingga selesai (biarkan pengaturan default).

### 2. Laragon (Untuk Database MySQL)
Aplikasi ini menggunakan database MySQL untuk menyimpan data. Laragon adalah cara paling mudah untuk menjalankan MySQL di Windows.
- **Download di sini:** [https://laragon.org/download/](https://laragon.org/download/)
- **Versi:** Pilih **Laragon Full**.
- **Cara Install:** Install seperti aplikasi biasa. Setelah terinstal, kamu akan mendapatkan aplikasi Laragon dan aplikasi bernama **HeidiSQL** (untuk melihat isi tabel database).
- *(Jika kamu sudah punya XAMPP dan terbiasa memakainya, kamu juga bisa menggunakan XAMPP untuk menyalakan MySQL).*

---

## 🚀 Panduan Instalasi Lengkap (Langkah demi Langkah)

Ikuti langkah-langkah di bawah ini secara berurutan agar aplikasi berhasil berjalan.

### Tahap 1: Setup Database MySQL

1. **Buka aplikasi Laragon** yang sudah kamu install.
2. Klik tombol **"Start All"** yang besar.
3. Pastikan tulisan **MySQL** di dalam kotak muncul informasi port (biasanya tulisan `MySQL - 3306` dan ada indikator hijau).
4. Klik tombol **"Database"** di aplikasi Laragon. Ini akan otomatis membuka aplikasi **HeidiSQL**.
5. Saat HeidiSQL terbuka, akan ada kotak dialog. Klik tombol **"Open"** di pojok kanan bawah.
6. Sekarang kamu masuk ke halaman utama HeidiSQL. Di bagian panel kosong sebelah kiri, **Klik Kanan -> pilih Create new -> pilih Database**.
7. Beri nama database dengan nama persis seperti ini: `kampus_pinjam` (gunakan huruf kecil semua dan garis bawah/underscore).
8. Klik **OK**. Database kosong berhasil dibuat! Biarkan Laragon tetap berjalan di latar belakang komputermu.

---

### Tahap 2: Menjalankan Backend API

Backend adalah mesin yang memproses data dan terhubung ke database.

1. Buka folder proyek **Peminjaman Mahasiswa** di komputer kamu.
2. Buka folder `backend`.
3. Di dalam folder `backend`, tekan tombol **Shift** pada keyboard, lalu **Klik Kanan** di area kosong, dan pilih **"Open in Terminal"** atau **"Open Command Prompt here"** atau **"Open in PowerShell"**.
4. Saat layar hitam Terminal terbuka, ketik perintah berikut lalu tekan **Enter**:
   ```bash
   npm install
   ```
   *Tunggu hingga proses download selesai. Proses ini membutuhkan koneksi internet.*

5. **Membuat File Konfigurasi (.env)**
   - Di dalam folder `backend`, kamu perlu membuat file baru bernama **`.env`** (titik env, tidak ada nama depan).
   - Buka file `.env` tersebut menggunakan Notepad (atau VS Code), lalu *copy-paste* teks di bawah ini ke dalamnya:
   
   ```env
   # Pengaturan Server
   PORT=5000
   NODE_ENV=development

   # Pengaturan Database MySQL
   # Format: mysql://USER:PASSWORD@localhost:3306/NAMA_DATABASE
   # Secara default Laragon usernya "root" tanpa password
   DATABASE_URL="mysql://root:@localhost:3306/kampus_pinjam"

   # Keamanan Token Login (Bebas diisi apa saja)
   JWT_SECRET=rahasia_kampus_rent_2024
   JWT_EXPIRES_IN=7d

   # URL Frontend (Biarkan seperti ini)
   FRONTEND_URL=http://localhost:5173
   ```
   - *Simpan file tersebut (Ctrl + S).*

6. **Membangun Struktur Database**
   Kembali ke layar hitam Terminal tadi (pastikan masih di folder `backend`), jalankan 3 perintah berikut satu persatu:
   
   ```bash
   npx prisma generate
   ```
   *(Tekan Enter)*

   ```bash
   npx prisma migrate dev --name init
   ```
   *(Tekan Enter. Ini akan otomatis membuat semua tabel yang dibutuhkan di HeidiSQL).*

   ```bash
   node seedCategories.js
   ```
   *(Tekan Enter. Ini opsional, fungsinya agar kategori barang seperti "Laptop", "Buku", dll langsung tersedia di web).*

7. **Nyalakan Server Backend**
   Masih di Terminal yang sama, jalankan perintah:
   ```bash
   npm run dev
   ```
   Jika muncul tulisan `✅ Database connected successfully` dan `Kampus Pinjam API Server Running on: http://localhost:5000`, selamat! **Backend kamu sudah menyala.**
   > ⚠️ **PENTING: JANGAN TUTUP JENDELA TERMINAL INI! BIARKAN TERBUKA.**

---

### Tahap 3: Menjalankan Frontend Website

Frontend adalah tampilan antarmuka (website) yang akan kamu klik dan lihat.

1. Buka lagi folder utama **Peminjaman Mahasiswa**.
2. Masuk ke folder `frontend`.
3. Buka **Terminal BARU** di dalam folder `frontend` ini (Shift + Klik Kanan -> Open in Terminal).
4. Instalasi library (membutuhkan internet):
   ```bash
   npm install
   ```
   *Tunggu hingga proses selesai.*
5. Jalankan websitenya:
   ```bash
   npm run dev
   ```
6. Terminal akan menampilkan tulisan: `➜  Local: http://localhost:5173/`.
   > ⚠️ **PENTING: JANGAN TUTUP JENDELA TERMINAL KEDUA INI JUGA!**

7. **Buka Browser (Chrome/Firefox/Edge)** dan ketik alamat: **http://localhost:5173**

Selesai! Aplikasi CampusRent sudah bisa kamu gunakan sepenuhnya! 🎉

---

## 📂 Struktur Folder Proyek

Untuk mempermudah kamu memahami isi dari aplikasi ini, berikut adalah rincian struktur foldernya:

```text
Peminjaman Mahasiswa/
├── 📁 backend/                        # Kode server (Node.js & Express)
│   ├── 📁 prisma/                     # Konfigurasi database & Schema ORM
│   ├── 📁 public/                     # Folder penyimpanan file upload (foto KTM, barang bukti bayar)
│   ├── 📁 src/
│   │   ├── 📁 config/                 # Konfigurasi koneksi database
│   │   ├── 📁 controllers/            # Logika bisnis dan pemrosesan data (API)
│   │   ├── 📁 middleware/             # Middleware autentikasi, error handler, multer (upload)
│   │   ├── 📁 routes/                 # Definisi endpoint (URL) API
│   │   └── 📁 utils/                  # Fungsi-fungsi bantuan (response formatter)
│   ├── server.js                      # Entry point backend
│   └── package.json                   # Daftar library backend
│
├── 📁 frontend/                       # Kode antarmuka web (React & Vite)
│   ├── 📁 public/                     # Aset statis public
│   ├── 📁 src/
│   │   ├── 📁 assets/                 # File aset seperti logo & gambar ilustrasi
│   │   ├── 📁 components/             # Komponen UI yang dapat digunakan kembali (Navbar, Layout, Card)
│   │   ├── 📁 context/                # Pengaturan Global State (Sesi Login User)
│   │   ├── 📁 pages/                  # Halaman aplikasi (Beranda, Detail Barang, Chat, dll)
│   │   ├── 📁 services/               # Kumpulan fungsi pemanggil API backend (Axios)
│   │   ├── App.jsx                    # Komponen utama dan pengaturan Rute (Routing)
│   │   └── index.css                  # Gaya CSS global & konfigurasi tema terang/gelap
│   ├── vite.config.js                 # Konfigurasi bundler Vite
│   └── package.json                   # Daftar library frontend
│
└── README.md                          # Dokumentasi panduan instalasi & penggunaan
```

---

## 🗺️ Alur Penggunaan

### Alur Mahasiswa (Peminjam)
```
Daftar Akun → Upload KTM → Tunggu Verifikasi Admin
      ↓
Jelajahi Barang → Lihat Detail → Ajukan Pinjam
      ↓
Tunggu Persetujuan Pemilik
      ↓
Approved → Chat Room Otomatis Terbuka → Atur Serah Terima
      ↓
Status: DIPINJAM → Pakai Barang → Kembalikan
      ↓
Status: SELESAI → Beri Rating & Ulasan
```

### Alur Mahasiswa (Pemilik Barang)
```
Daftar Akun → Upload KTM → Tambah Barang (hingga 5 foto)
      ↓
Tunggu Ada yang Mengajukan Pinjam
      ↓
Terima Notifikasi → Setujui atau Tolak
      ↓
Approved → Chat dengan Peminjam → Serahkan Barang
      ↓
Konfirmasi Barang Dikembalikan → Selesai → Dapat Review
```

### Alur Admin
```
Login sebagai Admin → Buka Panel Admin
      ↓
Tab "Verifikasi KTM" → Cek foto KTM → Setujui atau Tolak
      ↓
Tab "Laporan" → Tinjau laporan masuk → Suspend akun bermasalah
      ↓
Tab "Barang" → Monitor & ban barang yang bermasalah
```

---

## 🛡️ Akun Admin

### Cara Membuat Admin — Otomatis (Pertama Kali Setup)
1. Buka http://localhost:5173 di browser
2. Klik **Daftar** dan isi form lengkap
3. Akun **pertama yang mendaftar** otomatis mendapat role **ADMIN**
4. Login → klik avatar di pojok kanan atas → pilih **Panel Admin**

### Cara Membuat Admin — Manual (Jika Sudah Ada User Lain)
Jalankan perintah berikut dari folder `backend/`:
```bash
node setAdmin.js email@contoh.com
```
Ganti `email@contoh.com` dengan email akun yang ingin dijadikan Admin.

---

## 📡 API Endpoints

Semua endpoint memerlukan header `Authorization: Bearer <TOKEN>` kecuali yang bertanda `[Public]`.

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Daftar akun baru | Public |
| `POST` | `/api/auth/login` | Login | Public |
| `GET` | `/api/items` | Semua barang + filter | Public |
| `GET` | `/api/items/:id` | Detail satu barang | Public |
| `POST` | `/api/items` | Tambah barang (multipart/form-data) | 🔐 |
| `PATCH` | `/api/items/:id` | Edit barang | 🔐 |
| `DELETE` | `/api/items/:id` | Hapus barang | 🔐 |
| `POST` | `/api/transactions` | Ajukan transaksi pinjam | 🔐 |
| `GET` | `/api/transactions` | Riwayat transaksi pengguna | 🔐 |
| `PATCH` | `/api/transactions/:id/status` | Update status transaksi | 🔐 |
| `GET` | `/api/chat/conversations` | Daftar percakapan | 🔐 |
| `GET` | `/api/chat/:transactionId/messages` | Pesan dalam chat | 🔐 |
| `POST` | `/api/chat/:transactionId/messages` | Kirim pesan/foto/lokasi | 🔐 |
| `GET` | `/api/profile` | Data profil sendiri | 🔐 |
| `PUT` | `/api/profile` | Update biodata | 🔐 |
| `PUT` | `/api/profile/avatar` | Ganti foto profil | 🔐 |
| `PUT` | `/api/profile/ktm` | Upload foto KTM | 🔐 |
| `GET` | `/api/notifications` | Daftar notifikasi | 🔐 |
| `GET` | `/api/wishlist` | Daftar wishlist | 🔐 |
| `POST` | `/api/wishlist/:itemId` | Tambah ke wishlist | 🔐 |
| `DELETE` | `/api/wishlist/:itemId` | Hapus dari wishlist | 🔐 |
| `POST` | `/api/reviews/:transactionId` | Beri ulasan/rating | 🔐 |
| `POST` | `/api/reports` | Laporkan pengguna | 🔐 |
| `GET` | `/api/admin/users` | Kelola semua pengguna | 🔐 Admin |
| `PATCH` | `/api/admin/users/:id/verify` | Verifikasi KTM pengguna | 🔐 Admin |
| `PATCH` | `/api/admin/users/:id/suspend` | Suspend/aktifkan pengguna | 🔐 Admin |

---

## ⚙️ Konfigurasi `.env`

> File `.env` **tidak diikutkan** dalam repository karena berisi data sensitif. Wajib dibuat sendiri.

### `backend/.env`

```env
# Port server backend
PORT=5000

# Mode: development atau production
NODE_ENV=development

# Koneksi Database MySQL
# Tanpa password:
DATABASE_URL="mysql://root:@localhost:3306/kampus_pinjam"
# Dengan password:
# DATABASE_URL="mysql://root:PASSWORD@localhost:3306/kampus_pinjam"

# Kunci rahasia JWT — ganti dengan string acak yang kuat untuk production!
JWT_SECRET=kampus_pinjam_secret_key_2024_very_long_and_secure
JWT_EXPIRES_IN=7d

# URL frontend untuk konfigurasi CORS
FRONTEND_URL=http://localhost:5173
```

### Penjelasan Variabel

| Variabel | Wajib | Penjelasan |
|---|---|---|
| `PORT` | Ya | Port server backend (default: 5000) |
| `DATABASE_URL` | Ya | Koneksi MySQL. Ubah jika ada password atau nama database berbeda |
| `JWT_SECRET` | Ya | Kunci rahasia untuk enkripsi token. **Harus diganti** jika deploy ke production |
| `JWT_EXPIRES_IN` | Ya | Durasi token aktif. Contoh: `7d` = 7 hari, `24h` = 24 jam |
| `FRONTEND_URL` | Ya | URL frontend untuk izin CORS. Ubah sesuai server jika deploy |

---

## 🔍 Troubleshooting

### ❌ "Cannot connect to database" / Database Error
- Pastikan **Laragon/XAMPP sudah dijalankan** dan MySQL berwarna hijau
- Periksa `DATABASE_URL` di `.env` — nama database harus `kampus_pinjam`
- Coba buka HeidiSQL dan pastikan database `kampus_pinjam` ada

### ❌ "Prisma migration failed"
- Coba alternatif: `npx prisma db push`
- Pastikan database `kampus_pinjam` sudah dibuat terlebih dahulu di MySQL

### ❌ Login/Register selalu gagal
- Pastikan backend berjalan di port `5000` dan frontend di `5173`
- Pastikan file `.env` sudah benar
- Buka browser Incognito → hapus Local Storage browser → coba login ulang

### ❌ Foto tidak muncul setelah diupload
- Pastikan folder `backend/public/uploads/` ada dan bisa ditulis
- Ukuran foto maksimal: **5MB** per foto
- Format yang didukung: `.jpg`, `.jpeg`, `.png`, `.webp`

### ❌ Chat tidak bisa dibuka / tidak muncul
- Chat hanya tersedia untuk transaksi berstatus **APPROVED atau lebih lanjut**
- Pastikan pemilik barang sudah menyetujui transaksi terlebih dahulu

### ❌ Foto di Chat tidak terkirim
- Format yang didukung: `.jpg`, `.jpeg`, `.png`, `.webp`
- Ukuran maksimal: **5MB**. Foto di atas 5MB akan langsung ditolak dengan notifikasi

### ❌ Backend crash saat start
- Periksa apakah file `.env` sudah ada dan isinya benar
- Jalankan ulang: `npm run dev` di folder `backend/`
- Jika error `TypeError: argument handler is not a function`, periksa file di folder `src/routes/`

---

> 🎓 Dikembangkan untuk mendukung ekosistem kolaborasi dan berbagi antar mahasiswa.
