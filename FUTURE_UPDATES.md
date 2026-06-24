# 🚀 Ide Pengembangan Lanjutan (Future Updates) - CampusRent

Dokumen ini berisi daftar ide dan saran fitur untuk meningkatkan aplikasi CampusRent di masa mendatang agar lebih profesional dan *scalable*.

---

## 💡 Fitur Skala Prioritas Tinggi

### 1. Integrasi Payment Gateway Otomatis (Midtrans / Xendit)
- **Kondisi Saat Ini:** Pembayaran mengandalkan transfer manual antar bank/e-wallet, peminjam harus *upload* bukti transfer, dan Admin harus melakukan verifikasi (*Approve/Reject*) satu per satu.
- **Rencana Peningkatan:** Integrasi dengan penyedia *Payment Gateway* resmi (seperti Midtrans, Xendit, atau Duitku).
- **Keuntungan:** Saat mahasiswa membayar menggunakan QRIS, GoPay, atau Virtual Account Bank, sistem *backend* akan menerima *callback* (WebHook) dan langsung mengubah status transaksi menjadi `PAID` secara otomatis dalam hitungan detik.

### 2. Chat & Notifikasi Real-Time (menggunakan Socket.io)
- **Kondisi Saat Ini:** Pengguna harus menyegarkan (*refresh*) halaman atau menggunakan *polling* API (memanggil database berulang kali setiap detik) untuk melihat apakah ada pesan/notifikasi baru. Ini sangat membebani *database*.
- **Rencana Peningkatan:** Memasang peladen (*server*) WebSockets (`socket.io`).
- **Keuntungan:** Pesan chat dan notifikasi pesanan masuk akan langsung muncul secara instan (*real-time*), persis seperti WhatsApp. Hemat beban peladen dan meningkatkan *User Experience* secara drastis.

---

## 📈 Fitur Skala Prioritas Menengah (Peningkatan UX)

### 3. Pencarian Berbasis Lokasi (Geolokasi)
- **Kondisi Saat Ini:** Kolom pencarian hanya mencari berdasarkan nama barang dan kategori saja.
- **Rencana Peningkatan:** Meminta akses GPS pengguna pada penjelajah web (*browser*), atau memungkinkan pengguna mengisi alamat rinci mereka.
- **Keuntungan:** Menampilkan barang-barang dari yang "Paling Dekat" (contoh: *Hanya berjarak 300 meter dari kost Anda*). Ini akan meningkatkan jumlah sewa karena mahasiswa lebih memilih menyewa barang yang dekat agar ongkos transportnya murah.

### 4. Kalender Ketersediaan Cerdas (Smart Date Picker)
- **Kondisi Saat Ini:** Peminjam hanya memasukkan jumlah hari pinjam tanpa bisa memesan tanggal tertentu untuk masa depan.
- **Rencana Peningkatan:** Mengimplementasikan antarmuka kalender visual (mirip *Traveloka* atau *Airbnb*) di halaman Detail Barang.
- **Keuntungan:** Pemilik bisa melihat tanggal berapa saja barangnya dipinjam. Peminjam bisa melakukan "Reservasi/Booking" untuk minggu depan dengan melihat ketersediaan tanggal yang masih kosong pada kalender.

### 5. Aplikasi Progressive Web App (PWA)
- **Kondisi Saat Ini:** Aplikasi hanya berupa *website* biasa. Pengguna harus membuka peramban web dan mengetik URL.
- **Rencana Peningkatan:** Menambahkan `manifest.json` dan *Service Workers* pada *frontend* (React).
- **Keuntungan:** *Website* dapat langsung di-install menjadi aplikasi di layar beranda (Home Screen) Android dan iOS tanpa harus masuk ke PlayStore/AppStore. Dapat berjalan sebagian meski tidak ada koneksi internet (*offline fallback*).

---

## 🏆 Fitur Skala Ekstra (Ekspansi Bisnis)

### 6. Dashboard Analitik untuk Pemilik Barang (Owner)
- **Kondisi Saat Ini:** Pemilik barang (mahasiswa yang menyewakan) hanya punya fitur standar melihat "Barang Saya".
- **Rencana Peningkatan:** Membuat halaman khusus `Owner Dashboard`.
- **Keuntungan:** Menampilkan grafik pendapatan per bulan, data analitik (barang mana yang paling sering diklik, namun jarang disewa), dan *tips* bagi pemilik untuk memberikan performa harga yang lebih baik.

### 7. Integrasi Ekspedisi / Kurir Mahasiswa
- **Kondisi Saat Ini:** Peminjam dan Pemilik harus bertemu tatap muka (COD) untuk serah terima barang.
- **Rencana Peningkatan:** Menambahkan opsi pengiriman antar jemput (layaknya GOSend lokal kampus).
- **Keuntungan:** Mahasiswa lain bisa mendaftar menjadi "Kurir Kampus", mendapat uang saku dari mengantarkan barang sewaan dari kos pemilik ke kos peminjam. Menciptakan ekosistem kampus yang mandiri.
