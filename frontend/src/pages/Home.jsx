import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import categoryService from '../services/category.service';
import itemService from '../services/item.service';
import CustomSelect from '../components/common/CustomSelect';
import PromoBanner from '../components/common/PromoBanner';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const CATEGORY_ICONS = {
 'elektronik': 'devices',
 'buku': 'menu_book',
 'alat_lab': 'science',
 'gaming': 'sports_esports',
 'pakaian': 'styler',
 'kendaraan': 'directions_car',
 'olahraga': 'sports_basketball',
 'musik': 'music_note'
};

const getCategoryIcon = (name) => {
 const normalized = name.toLowerCase();
 for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
 if (normalized.includes(key)) return icon;
 }
 return 'category';
};

const Home = () => {
 const navigate = useNavigate();
 
 const [categories, setCategories] = useState([]);
 const [popularItems, setPopularItems] = useState([]);
 
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('all');
 
 useEffect(() => {
 categoryService.getCategories().then(res => {
 if (Array.isArray(res.data)) {
 // Only take the first 5 categories for the grid as per design
 setCategories(res.data.slice(0, 5));
 }
 }).catch(console.error);

 itemService.getItems({ limit: 4, status: 'TERSEDIA' }).then(res => {
 if (Array.isArray(res.data)) {
 setPopularItems(res.data);
 }
 }).catch(console.error);
 }, []);

 const handleSearch = (e) => {
 e.preventDefault();
 const params = new URLSearchParams();
 if (searchQuery) params.append('search', searchQuery);
 if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
 navigate(`/items?${params.toString()}`);
 };

 const renderStars = (rating) => {
 return (
 <div className="flex items-center text-tertiary-fixed-dim bg-tertiary-fixed/10 px-2 py-0.5 rounded-md text-sm font-bold">
 <span className="material-symbols-outlined text-[16px] mr-1" style={{ fontVariationSettings:"'FILL' 1" }}>star</span> {rating || '4.8'}
 </div>
 );
 };

 return (
 <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md transition-colors duration-300 overflow-x-hidden">
 <main className="flex-grow dot-pattern">
 
 {/* Enhanced Hero Section (Split Layout) */}
 <section className="relative w-full min-h-[750px] flex items-center justify-center overflow-hidden pt-16 pb-24 lg:pt-0 lg:pb-0">
 {/* Decorative Blobs */}
 <div className="blob blob-1"></div>
 <div className="blob blob-2"></div>
 <div className="blob blob-3"></div>
 
 <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
 
 {/* Text Content */}
 <div className="flex flex-col items-start text-left">
 <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-label-md mb-6 border border-primary/20 backdrop-blur-md shadow-sm">
 <span className="relative flex h-2.5 w-2.5">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
 </span>
 Platform Peminjaman #1 Mahasiswa
 </span>
 
 <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-md leading-tight drop-shadow-sm font-extrabold">
 Sewa Barang Impianmu <br/> 
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-surface-tint">
 Dengan Lebih Mudah
 </span>
 </h1>
 
 <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-stack-xl drop-shadow-sm">
 Platform peminjaman antar mahasiswa yang terpercaya. Sewa kamera, buku, hingga alat lab dengan harga bersahabat dan komunitas yang aman.
 </p>
 
 {/* Search Widget (Glassmorphism) */}
 <form onSubmit={handleSearch} className="glass-panel w-full rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-3 shadow-[0_16px_40px_rgba(0,74,198,0.15)] transition-all duration-300 ring-1 ring-white/40">
 <div className="flex-shrink-0 w-full sm:w-48 relative px-3 py-1 bg-surface-container-low rounded-xl border border-outline-variant/20">
 <CustomSelect 
 className="w-full py-2 border-0 bg-transparent focus-within:ring-0 outline-none transition-all font-body-md"
 value={selectedCategory}
 onChange={setSelectedCategory}
 placeholder="Semua Kategori"
 options={[
 { value: 'all', label: 'Semua Kategori' },
 ...categories.map(cat => ({ value: cat.name.toLowerCase(), label: cat.name.replace('_', ' ') }))
 ]}
 />
 </div>
 
 <div className="flex-grow w-full flex items-center px-4 py-2 bg-surface-container-low rounded-xl border border-outline-variant/20 h-full min-h-[48px]">
 <span className="material-symbols-outlined text-outline-variant mr-2">search</span>
 <input 
 className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-body-md text-body-md placeholder:text-outline-variant p-0 outline-none" 
 placeholder="Cari barang..." 
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 
 <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-primary to-surface-tint hover:from-surface-tint hover:to-primary text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg flex-shrink-0 shadow-primary/30">
 Cari
 </button>
 </form>

 {/* Trust Indicators under search */}
 <div className="mt-8 flex items-center gap-6 text-sm text-on-surface-variant font-medium">
 <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-lg">shield_lock</span> Aman & Terpercaya</div>
 <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">school</span> Khusus Mahasiswa</div>
 </div>
 </div>

 {/* Hero Image Composition */}
 <div className="relative hidden lg:block h-[600px] w-full">
 <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary-container/20 rounded-3xl transform rotate-3 scale-105 -z-10 blur-xl"></div>
 <img alt="Students using CampusRent" className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white relative z-10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNlbNKAzt03NeIjbnHX3Yu_UEv1WkiRdkWGz-DhwoUx6eHa8dArhB_faEHQIXEKSy4RlC4ntKRtHqwyda7Z4vw05nAsW0B17QE4RHBH2H9KA1Lb-zvYecAxXU1z2LWB3t7CrcnIFwEbwOogrc9jQj7__QRKmRhxfaUarBbvwvsSMytLFrgB24aivW1anaWlFfnBAkT6Oy36MyY1VwhfcnkLfwSkthmVAZJER-kwh8o0cVLZkQ8kqbIxA"/>
 
 {/* Floating UI Element */}
 <div className="absolute -bottom-6 -left-6 glass-panel p-4 rounded-2xl shadow-xl flex items-center gap-4 z-20 animate-bounce" style={{ animationDuration: '3s' }}>
 <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center">
 <span className="material-symbols-outlined">camera</span>
 </div>
 <div>
 <p className="font-label-md font-bold text-on-surface">Sony A6000 Disewa</p>
 <p className="text-xs text-on-surface-variant">Baru saja oleh Andi, UI</p>
 </div>
 </div>
 </div>

 </div>
 </section>

 {/* Live Feed / New Arrivals Ticker */}
 <section className="w-full bg-primary/5 border-y border-primary/10 overflow-hidden py-3">
 <div className="flex whitespace-nowrap animate-marquee items-center gap-8 px-4">
 <span className="font-label-md text-primary font-semibold flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span> Live Activity:
 </span>
 <span className="text-sm text-on-surface-variant">Budi menyewa Proyektor Mini (ITB)</span>
 <span className="text-primary/30">•</span>
 <span className="text-sm text-on-surface-variant">Siti menambahkan Buku Kalkulus (UGM)</span>
 <span className="text-primary/30">•</span>
 <span className="text-sm text-on-surface-variant">Kamera DSLR baru tersedia (UI)</span>
 <span className="text-primary/30">•</span>
 <span className="text-sm text-on-surface-variant">Transaksi sukses Rp 50.000 (UNPAD)</span>
 <span className="text-primary/30">•</span>
 <span className="text-sm text-on-surface-variant">Budi menyewa Proyektor Mini (ITB)</span>
 <span className="text-primary/30">•</span>
 <span className="text-sm text-on-surface-variant">Siti menambahkan Buku Kalkulus (UGM)</span>
 </div>
 </section>

 {/* Trust/Stats Bar (Redesigned) */}
 <section className="w-full bg-surface-container-highest py-10 relative z-30 shadow-xl mt-8">
 <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter flex flex-wrap justify-center md:justify-between items-center gap-8 text-center">
 <div className="flex flex-col items-center group">
 <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner">
 <span className="material-symbols-outlined text-3xl text-primary">group</span>
 </div>
 <span className="font-display-lg text-3xl font-extrabold text-on-surface">10,000+</span>
 <span className="font-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Mahasiswa Tergabung</span>
 </div>
 <div className="hidden md:block w-px h-20 bg-outline-variant/20"></div>
 <div className="flex flex-col items-center group">
 <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner">
 <span className="material-symbols-outlined text-3xl text-secondary">inventory_2</span>
 </div>
 <span className="font-display-lg text-3xl font-extrabold text-on-surface">5,000+</span>
 <span className="font-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Barang Tersedia</span>
 </div>
 <div className="hidden md:block w-px h-20 bg-outline-variant/20"></div>
 <div className="flex flex-col items-center group">
 <div className="w-16 h-16 bg-tertiary/10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner">
 <span className="material-symbols-outlined text-3xl text-tertiary">account_balance</span>
 </div>
 <span className="font-display-lg text-3xl font-extrabold text-on-surface">50+</span>
 <span className="font-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Universitas</span>
 </div>
 </div>
 </section>

 {/* Categories (Enhanced Cards) */}
 <section className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-16 relative z-20">
 <div className="text-center mb-10">
 <h2 className="font-display-lg text-3xl text-on-surface font-extrabold mb-2">Eksplorasi Kategori</h2>
 <p className="text-on-surface-variant">Temukan barang sesuai kebutuhan studimu</p>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
 {categories.map((cat, idx) => {
 const themeColors = [
 { base: 'primary', hex: 'from-primary/10 to-primary/30', border: 'hover:border-primary/20', text: 'text-primary' },
 { base: 'secondary', hex: 'from-secondary/10 to-secondary/30', border: 'hover:border-secondary/20', text: 'text-secondary' },
 { base: 'tertiary', hex: 'from-tertiary/10 to-tertiary/30', border: 'hover:border-tertiary/20', text: 'text-tertiary' },
 { base: 'error', hex: 'from-error/10 to-error/30', border: 'hover:border-error/20', text: 'text-error' },
 { base: 'surface-tint', hex: 'from-surface-tint/10 to-surface-tint/30', border: 'hover:border-surface-tint/20', text: 'text-surface-tint' },
 ];
 const theme = themeColors[idx % themeColors.length];
 
 return (
 <Link 
 key={cat.id}
 to={`/items?category=${cat.name.toLowerCase()}`}
 className={`glass-panel rounded-2xl p-6 flex flex-col items-center gap-4 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group border-2 border-transparent ${theme.border} bg-surface/50`}
 >
 <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${theme.hex} flex items-center justify-center ${theme.text} group-hover:scale-110 transition-transform shadow-inner`}>
 <span className="material-symbols-outlined text-4xl">{getCategoryIcon(cat.name)}</span>
 </div>
 <span className="font-title-md text-lg text-on-surface font-bold text-center capitalize">{cat.name.replace('_', ' ')}</span>
 </Link>
 );
 })}
 </div>
 </section>

  {/* Promotional Banner */}
  <section className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-8">
    <PromoBanner />
  </section>

 {/* Popular Items Grid (Enhanced layout) */}
 <section className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-16">
 <div className="flex justify-between items-end mb-10 border-b border-outline-variant/20 pb-4">
 <div>
 <h2 className="font-display-lg text-3xl text-on-surface font-extrabold">Barang Populer</h2>
 <p className="font-body-md text-on-surface-variant mt-2">Paling sering dipinjam minggu ini</p>
 </div>
 <Link to="/items" className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1 bg-primary/5 px-4 py-2 rounded-full transition-colors hover:bg-primary/10">
 Lihat Semua <span className="material-symbols-outlined text-sm">arrow_forward</span>
 </Link>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 {popularItems.map((item) => (
 <Link 
 key={item.id}
 to={`/items/${item.id}`} 
 className="group bg-surface rounded-2xl overflow-hidden flex flex-col hover:-translate-y-2 transition-all duration-300 shadow-md hover:shadow-2xl border border-outline-variant/10 relative"
 >
 <div className="relative aspect-square w-full overflow-hidden bg-surface-container-high">
 {item.fotoBarang ? (
 <img 
 src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} 
 alt={item.namaBarang} 
 className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-surface-variant text-on-surface-variant font-label-md">No Image</div>
 )}
 
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
 
 <div className="absolute top-4 left-4 bg-surface/95 backdrop-blur-md rounded-full px-4 py-1.5 font-title-md text-primary font-bold shadow-lg flex items-center gap-1">
 {item.hargaSewa === 0 ? 'Gratis' : `Rp ${item.hargaSewa.toLocaleString('id-ID')}`} 
 {item.hargaSewa > 0 && <span className="font-normal text-on-surface-variant text-xs">/hari</span>}
 </div>
 
 {item.pemilik?.role === 'ADMIN' && (
 <div className="absolute bottom-4 left-4 bg-secondary text-white backdrop-blur-md rounded-full px-3 py-1 font-label-sm text-xs font-bold shadow-md flex items-center gap-1 z-10">
 <span className="material-symbols-outlined text-[14px]">verified</span> Terverifikasi
 </div>
 )}
 </div>
 
 <div className="p-5 flex flex-col gap-3 relative bg-surface z-10">
 <div className="flex justify-between items-start">
 <h3 className="font-title-md text-lg text-on-surface font-bold line-clamp-1 group-hover:text-primary transition-colors pr-2">
 {item.namaBarang}
 </h3>
 {renderStars(4.8)}
 </div>
 
 <div className="flex items-center gap-2 text-on-surface-variant font-label-md">
 <span className="material-symbols-outlined text-[18px] text-primary">location_on</span> 
 <span className="truncate">{item.lokasiPengambilan}</span>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </section>

 {/* Safety & Trust (Enhanced) */}
 <section className="w-full bg-gradient-to-b from-surface-container-low to-background py-20 relative overflow-hidden">
 {/* Decorative background */}
 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
 <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
 
 <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter text-center">
 <h2 className="font-display-lg text-4xl text-on-surface font-extrabold mb-4">Mengapa Memilih CampusRent?</h2>
 <p className="font-body-lg text-on-surface-variant mb-12 max-w-2xl mx-auto">Kami merancang platform yang memprioritaskan keamanan dan kenyamanan bertransaksi di lingkungan kampus.</p>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
 <div className="flex flex-col items-center bg-white p-10 rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-outline-variant/10 relative overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
 <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
 <span className="material-symbols-outlined text-5xl">verified_user</span>
 </div>
 <h4 className="font-title-md text-xl font-bold text-on-surface mb-3 relative z-10">Verifikasi KTM</h4>
 <p className="font-body-md text-on-surface-variant relative z-10">Keamanan terjamin. Semua pengguna adalah mahasiswa aktif yang telah melalui proses verifikasi identitas yang ketat.</p>
 </div>
 
 <div className="flex flex-col items-center bg-white p-10 rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-outline-variant/10 relative overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
 <div className="w-24 h-24 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
 <span className="material-symbols-outlined text-5xl">shield</span>
 </div>
 <h4 className="font-title-md text-xl font-bold text-on-surface mb-3 relative z-10">Asuransi Barang</h4>
 <p className="font-body-md text-on-surface-variant relative z-10">Pinjamkan barang berharga Anda tanpa rasa khawatir. Dilindungi asuransi komprehensif selama masa peminjaman.</p>
 </div>
 
 <div className="flex flex-col items-center bg-white p-10 rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-outline-variant/10 relative overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
 <div className="w-24 h-24 bg-tertiary/10 text-tertiary rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
 <span className="material-symbols-outlined text-5xl">payments</span>
 </div>
 <h4 className="font-title-md text-xl font-bold text-on-surface mb-3 relative z-10">Transaksi Aman</h4>
 <p className="font-body-md text-on-surface-variant relative z-10">Sistem pembayaran escrow pintar menjamin dana Anda aman dan baru diteruskan saat transaksi selesai.</p>
 </div>
 </div>
 </div>
 </section>

 {/* Student Testimonials (Chat Bubble Style) */}
 <section className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-20 relative">
 <h2 className="font-display-lg text-4xl text-on-surface font-extrabold mb-12 text-center">Komunitas Kami</h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
 {/* Testimonial 1 */}
 <div className="flex flex-col">
 <div className="bg-primary/10 p-6 rounded-2xl rounded-bl-none relative shadow-sm mb-4">
 <div className="chat-bubble-tail bg-primary/10"></div>
 <p className="font-body-lg text-on-surface relative z-10">"Sangat membantu pas butuh kamera dadakan buat tugas akhir. Harganya jauh lebih murah dari rental luar! Proses verifikasinya juga cepat."</p>
 </div>
 <div className="flex items-center gap-4 pl-4">
 <img alt="Budi Santoso" className="w-12 h-12 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAkAZbx4APJGZw3wRpIVHprZHZEQnyiVLUqCSJ3kC56h6eXAMPuvI_5X7WLYsloK0MmhElKzytwKUaNDFVPLFL0-TU--3FrjbEQ4freZaFnlnFz-GGO8l7nI8B4_uKtgvhkVzcis1DXxRY63G18f0vDUM1aLm1LE41jrpbmqFlbYGesCf2APKDsWgn8aRk1xLcOkNcHf6GXBz7Hk8Rms8lhblKta2iX2Cvig-9Y5L6vUISqfpRZcNEpQ"/>
 <div>
 <p className="font-title-md font-bold text-on-surface">Budi Santoso</p>
 <p className="text-sm text-primary font-semibold">Universitas Indonesia</p>
 </div>
 </div>
 </div>
 
 {/* Testimonial 2 */}
 <div className="flex flex-col lg:mt-8">
 <div className="bg-secondary/10 p-6 rounded-2xl rounded-br-none relative shadow-sm mb-4 ml-auto lg:ml-0">
 <div className="absolute -bottom-[10px] right-8 w-[20px] h-[20px] bg-secondary/10 border-b border-r border-transparent transform rotate-45 z-0"></div>
 <p className="font-body-lg text-on-surface relative z-10">"Nambah uang jajan lumayan banget nyewain buku teks yang udah gak kepake. Prosesnya gampang & aman. Sekarang malah ketagihan nyewain alat lab juga."</p>
 </div>
 <div className="flex items-center gap-4 pr-4 justify-end lg:justify-start lg:pl-4">
 <div className="text-right lg:text-left order-1 lg:order-2">
 <p className="font-title-md font-bold text-on-surface">Siti Rahma</p>
 <p className="text-sm text-secondary font-semibold">Institut Teknologi Bandung</p>
 </div>
 <img alt="Siti Rahma" className="w-12 h-12 rounded-full border-2 border-secondary object-cover order-2 lg:order-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYCyusq6c9sVF2CPRS-vjfzNdZrMWdrb6LRFlwRuQ4dDZ1KvXqzKdAWVOnJk8fAF7tYtTV9GOmkfcS2meMmW_Yd2AZNQzH_ZEU02KuiNUZBXJPoK0mGmIXZvuut-KOxJfHuLZsIXlxU8WdlYCaw2TIW2eHpAfxmV8rXjz8GVBxDAAKNdsLEN_TQAfdqiVx2cL1W_BlGqLzOQ7qRp4-C3oiwAhR6w-4unV_ZJ3OFoT8s2xswW7ke6ocyg"/>
 </div>
 </div>
 
 {/* Testimonial 3 */}
 <div className="flex flex-col hidden lg:flex mt-16">
 <div className="bg-surface-variant p-6 rounded-2xl rounded-bl-none relative shadow-sm mb-4">
 <div className="chat-bubble-tail bg-surface-variant"></div>
 <p className="font-body-lg text-on-surface relative z-10">"Aplikasi wajib buat mahasiswa kos! Kemarin minjem proyektor buat nobar bareng temen, kualitas barang terjamin dan ownernya ramah banget."</p>
 </div>
 <div className="flex items-center gap-4 pl-4">
 <img alt="Andi Pratama" className="w-12 h-12 rounded-full border-2 border-outline object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAr7pn9N11UmOUxnD6A9KO7gHZAqQXvANYyAyoeIF8lqomrvurTBpOVTsUqL-QCsKS58I0iHIlSXSdjigXyjAjDKh2YGUhH_IoAuWP3SSKECJW16km4oasi_gq8C_1YBQFDYMvM1FAjjswJUgqcRT7sdTogLKemj_dG3t30ZN3s47iir3xGsKxbLvz7dKzFDZA5sbruFszGrwWOR7a8sGTPuutB6OYzR0OYo7GLWuI3iZLWSc1iJsvXRQ"/>
 <div>
 <p className="font-title-md font-bold text-on-surface">Andi Pratama</p>
 <p className="text-sm text-on-surface-variant font-semibold">Universitas Gadjah Mada</p>
 </div>
 </div>
 </div>
 </div>
 </section>

 </main>
 </div>
 );
};

export default Home;
