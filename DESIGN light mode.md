---
name: CampusRent Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-mobile: 1rem
  stack-xs: 0.25rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 1.5rem
  stack-xl: 2.5rem
---

## Brand & Style
Sistem desain ini dirancang untuk menciptakan ekosistem peminjaman barang antar mahasiswa yang mengutamakan kepercayaan, kemudahan akses, dan rasa komunitas. Mengambil inspirasi dari estetika platform *marketplace* premium, gaya visual yang diusung adalah **Modern Glassmorphism** dengan sentuhan korporat yang ramah.

Tujuannya adalah untuk membuat interaksi peminjaman barang yang biasanya bersifat informal menjadi lebih profesional dan terorganisir. Penggunaan efek transparansi dan blur memberikan kesan kedalaman yang dinamis, sementara tata letak yang bersih memastikan fokus utama tetap pada katalog barang dan reputasi pengguna. UI harus terasa ringan, responsif, dan memberikan kesan "mahal" namun tetap inklusif bagi seluruh kalangan mahasiswa.

## Colors
Palet warna dipilih untuk menyeimbangkan antara fungsionalitas teknis dan kehangatan komunitas. 

- **Primary Gradient:** Kombinasi Royal Blue ke Indigo digunakan pada elemen aksi utama seperti tombol "Sewa Sekarang" atau status aktif untuk menunjukkan kredibilitas.
- **Success/Secondary:** Emerald Green digunakan untuk konfirmasi transaksi sukses dan status barang tersedia.
- **Warning/Accent:** Amber digunakan khusus untuk sistem rating dan penanda urgensi rendah.
- **Danger:** Rose/Red digunakan untuk peringatan denda, keterlambatan pengembalian, atau error sistem.
- **Neutrals:** Menggunakan skala Slate untuk menjaga kontras yang nyaman bagi mata, terutama dalam penggunaan jangka panjang.

Sistem ini mendukung **Dark Mode** secara penuh. Pada mode gelap, latar belakang menggunakan Slate-900 dengan elevasi kartu menggunakan Slate-800 dengan opasitas rendah untuk mempertahankan efek Glassmorphism.

## Typography
Tipografi menggunakan kombinasi **Plus Jakarta Sans** untuk elemen display dan heading guna memberikan kesan modern dan ramah, serta **Inter** untuk teks body guna memastikan keterbacaan maksimal pada berbagai ukuran layar.

Hierarki visual dibangun dengan perbedaan bobot (weight) yang kontras antara judul dan deskripsi. Untuk perangkat mobile, ukuran heading diturunkan secara proporsional agar tidak mendominasi viewport. Penggunaan *letter spacing* negatif pada ukuran display membantu teks terlihat lebih kohesif dan profesional.

## Layout & Spacing
Sistem menggunakan **Fluid Grid** 12-kolom untuk desktop dan 4-kolom untuk mobile. Jarak antar elemen didasarkan pada kelipatan 4px (8-point grid system) untuk menciptakan ritme visual yang konsisten.

- **Desktop:** Maksimal lebar kontainer 1280px dengan margin sisi yang fleksibel.
- **Tablet:** Transisi ke layout 8-kolom dengan gutter tetap 24px.
- **Mobile:** Penggunaan margin aman minimal 16px di sisi kiri dan kanan. Elemen vertikal menggunakan *stacking* yang lebih rapat (stack-md) untuk memaksimalkan konten di atas lipatan layar (*above the fold*).

## Elevation & Depth
Kedalaman visual dicapai melalui teknik **Glassmorphism** dan bayangan yang sangat halus (*soft shadows*). 

1.  **Glass Surfaces:** Kartu dan panel navigasi menggunakan latar belakang transparan (putih 80% pada mode terang / Slate-800 80% pada mode gelap) dengan `backdrop-blur-xl`.
2.  **Borders:** Setiap elemen transparan wajib memiliki border tipis (1px) dengan opasitas sangat rendah (putih 10% atau Slate-700 20%) untuk memberikan definisi tepi yang tajam.
3.  **Shadows:** Gunakan bayangan berlapis (ambient occlusion) dengan blur radius tinggi dan opasitas rendah (di bawah 8%). Hindari bayangan hitam pekat; gunakan warna bayangan yang sedikit ter-tint warna latar belakang (misalnya biru tua untuk mode gelap).

## Shapes
Bentuk visual utama adalah lingkaran dan persegi dengan sudut yang sangat membulat, mencerminkan sifat platform yang *approachable*.

- **Cards:** Menggunakan radius 16px hingga 24px (disesuaikan dengan ukuran kartu).
- **Buttons:** Menggunakan radius 12px untuk memberikan kesan kokoh namun tetap modern.
- **Input Fields:** Menggunakan radius 10px untuk membedakannya secara visual dari tombol aksi utama.
- **Avatars:** Selalu berbentuk lingkaran sempurna (border-radius 9999px) untuk menekankan aspek personal/manusia.

## Components
Setiap komponen dirancang untuk mendukung interaksi yang intuitif:

- **Buttons:** Tombol utama menggunakan `gradient_primary` dengan efek *hover* yang sedikit mencerahkan gradien. Tombol sekunder menggunakan *outline* tipis dengan latar belakang transparan.
- **Chips/Badges:** Digunakan untuk kategori barang (misal: "Elektronik", "Alat Musik"). Memiliki latar belakang pastel yang sangat lembut dengan teks warna solid.
- **Input Fields:** Saat fokus (*state: focus*), border harus berubah menjadi warna Primary dengan *outer glow* halus.
- **Cards (Katalog):** Harus menyertakan foto barang yang dominan, nama barang, harga sewa per hari, dan rating bintang. Seluruh area kartu dapat diklik.
- **Lists (Aktivitas):** Menampilkan histori peminjaman dengan status label yang jelas (Dipinjam, Kembali, Terlambat).
- **Checkboxes & Radios:** Menggunakan warna Primary saat terpilih, dengan animasi transisi skala kecil saat diklik.
- **Special Component - "Trust Badge":** Elemen kecil di profil pengguna atau detail barang yang menunjukkan bahwa pemilik adalah "Mahasiswa Terverifikasi" untuk membangun rasa aman.