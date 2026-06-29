import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import itemService from '../services/item.service';
import categoryService from '../services/category.service';
import wishlistService from '../services/wishlist.service';
import CustomSelect from '../components/common/CustomSelect';
import PromoBanner from '../components/common/PromoBanner';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const CATEGORY_ICONS = {
 'elektronik': 'devices',
 'buku': 'menu_book',
 'alat_lab': 'science',
 'gaming': 'sports_esports',
 'pakaian': 'checkroom',
 'kendaraan': 'directions_car',
 'olahraga': 'sports_basketball',
 'musik': 'piano',
 'outdoor': 'camping'
};

const getCategoryIcon = (name) => {
 const normalized = name.toLowerCase();
 for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
 if (normalized.includes(key)) return icon;
 }
 return 'category';
};

const Items = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const { isAuthenticated } = useAuth();

 const [items, setItems] = useState([]);
 const [categories, setCategories] = useState([]);
 const [wishlists, setWishlists] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 // Initialize filters from URL params if present
 const queryParams = new URLSearchParams(location.search);
 const initialSearch = queryParams.get('search') || '';
 const initialCategory = queryParams.get('category') || 'Semua';

 // Filters
 const [search, setSearch] = useState(initialSearch);
 const [kategori, setKategori] = useState(initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1));
 const [status, setStatus] = useState('Semua');
 const [universitas, setUniversitas] = useState('');

 // Geolocation states
 const [useLocationGeo, setUseLocationGeo] = useState(false);
 const [lat, setLat] = useState(null);
 const [lng, setLng] = useState(null);
 const [radius, setRadius] = useState(10); // default 10km

 useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchWishlists = async () => {
      if (isAuthenticated) {
        try {
          const res = await wishlistService.getWishlists();
          setWishlists(res.data.map(w => w.itemId));
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchCats();
    fetchWishlists();
  }, [isAuthenticated]);

 const fetchItems = async () => {
 setIsLoading(true);
 try {
 const params = {};
 if (search) params.search = search;
 // Handle the case where initial URL param is lowercase
 if (kategori && kategori !== 'Semua' && kategori !== 'all') {
 // Try to find the actual category name to match backend
 const foundCat = categories.find(c => c.name.toLowerCase() === kategori.toLowerCase());
 params.kategori = foundCat ? foundCat.name : kategori;
 }
 if (status !== 'Semua') params.status = status;
 if (universitas) params.universitas = universitas;
 if (useLocationGeo && lat && lng) {
 params.lat = lat;
 params.lng = lng;
 params.radius = radius;
 }

 const res = await itemService.getItems(params);
 setItems(res.data || []);
 } catch (err) {
 toast.error('Gagal memuat daftar barang');
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
    const delay = setTimeout(() => {
      fetchItems();
    }, 200);
    return () => clearTimeout(delay);
  }, [search, kategori, status, universitas, useLocationGeo, lat, lng, radius, categories]); // categories added to dependency to refetch if category from URL is mapped

  const handleWishlistToggle = async (e, itemId) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login', { state: { from: { pathname: '/items' } } });
      return;
    }
    try {
      await wishlistService.toggleWishlist(itemId);
      setWishlists(prev => 
        prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
      );
      toast.success(wishlists.includes(itemId) ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist');
    } catch (err) {
      toast.error('Gagal mengupdate wishlist');
    }
  };

 return (
 <div className="flex-grow dot-pattern flex flex-col items-center bg-background min-h-screen font-body-md transition-colors duration-300 overflow-x-hidden">
 
 {/* Search/Filter Header Area */}
 <section className="relative w-full pt-12 pb-8">
 <div className="blob blob-1"></div>
 <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10">
 <div className="flex flex-col gap-stack-sm items-center text-center mb-8">
 <h1 className="font-display-lg text-4xl md:text-5xl lg:text-[48px] font-extrabold text-on-background leading-tight">
 Temukan Barang <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-surface-tint">Incaranmu</span>
 </h1>
 <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto mt-2">
 Pinjam peralatan kuliah, buku, hingga alat musik dari sesama mahasiswa dengan mudah dan aman.
 </p>
 </div>

 {/* Filter Section & Popular Searches */}
 <div className="flex flex-col gap-4">
 <div className="glass-panel rounded-3xl p-6 shadow-[0_16px_40px_rgba(0,74,198,0.1)] flex flex-col gap-6 relative z-50 bg-white/60 backdrop-blur-xl border border-white/40">
 <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
 {/* Search */}
 <div className="relative md:col-span-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex items-center px-4 py-2">
 <span className="material-symbols-outlined text-outline-variant mr-2">search</span>
 <input
 className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-body-md text-body-md placeholder:text-outline-variant p-0 outline-none"
 placeholder="Cari nama barang..."
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>

 {/* Category */}
 <div className="relative md:col-span-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 px-3 py-1 flex items-center">
 <CustomSelect
 className="w-full"
 value={kategori}
 onChange={(val) => setKategori(val)}
 placeholder="Semua Kategori"
 options={[
 { value: 'Semua', label: 'Semua Kategori' },
 ...categories.map(k => ({ value: k.name, label: k.name.replace('_', ' ') }))
 ]}
 />
 </div>

 {/* University */}
 <div className="relative md:col-span-3 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex items-center px-4 py-2">
 <span className="material-symbols-outlined text-outline-variant mr-2">school</span>
 <input
 className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-body-md text-body-md placeholder:text-outline-variant p-0 outline-none"
 placeholder="Filter Universitas..."
 type="text"
 value={universitas}
 onChange={(e) => setUniversitas(e.target.value)}
 />
 </div>

 {/* Status */}
 <div className="relative md:col-span-2 bg-surface-container-low rounded-2xl border border-outline-variant/20 px-3 py-1 flex items-center">
 <CustomSelect
 className="w-full"
 value={status}
 onChange={(val) => setStatus(val)}
 options={[
 { value: 'Semua', label: 'Semua Status' },
 { value: 'TERSEDIA', label: 'Tersedia' },
 { value: 'DIPINJAM', label: 'Dipinjam' }
 ]}
 />
 </div>
 </div>

 <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-outline-variant/30">
 <label className="flex items-center gap-3 cursor-pointer group">
 <div className="relative flex items-center">
 <input
 className="peer sr-only"
 type="checkbox"
 checked={useLocationGeo}
 onChange={(e) => {
 const checked = e.target.checked;
 if (checked) {
 if (navigator.geolocation) {
 toast.loading('Mendapatkan lokasi...', { id: 'geosearch' });
 navigator.geolocation.getCurrentPosition(
 (position) => {
 setLat(position.coords.latitude);
 setLng(position.coords.longitude);
 setUseLocationGeo(true);
 toast.success('Lokasi ditemukan!', { id: 'geosearch' });
 },
 (error) => {
 toast.error('Gagal mendapatkan lokasi GPS.', { id: 'geosearch' });
 }
 );
 } else {
 toast.error('Geolokasi tidak didukung.');
 }
 } else {
 setUseLocationGeo(false);
 setLat(null);
 setLng(null);
 }
 }}
 />
 <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary-container peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
 </div>
 <span className="font-label-md text-on-surface-variant flex items-center gap-1.5 group-hover:text-on-surface transition-colors">
 <span className="material-symbols-outlined text-[20px]">my_location</span>
 Cari di Sekitar Saya
 </span>
 </label>

 {useLocationGeo && (
 <div className="flex items-center gap-2">
 <span className="font-label-sm text-outline">Jarak Maksimum:</span>
 <div className="relative min-w-[120px]">
 <CustomSelect
 className="w-full py-1.5 px-3 rounded-xl border border-outline-variant/20 bg-surface shadow-sm focus:ring-2 focus:ring-primary-container"
 value={radius.toString()}
 onChange={(val) => setRadius(Number(val))}
 options={[
 { value: '5', label: '5 km' },
 { value: '10', label: '10 km' },
 { value: '20', label: '20 km' },
 { value: '50', label: '50 km' }
 ]}
 />
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Popular Searches */}
 <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 mt-4 relative z-20">
 <span className="font-label-sm text-outline whitespace-nowrap">Pencarian Populer:</span>
 {['Kamera DSLR', 'Laptop Mac', 'Jas Almamater', 'Buku Kalkulus', 'Tenda Camping'].map(term => (
 <button
 key={term}
 onClick={() => setSearch(term)}
 className="px-4 py-1.5 rounded-full border border-outline-variant/30 bg-surface-container-lowest/50 text-on-surface-variant font-label-md text-sm hover:bg-primary/5 hover:border-primary/30 transition-colors whitespace-nowrap backdrop-blur-md"
 >
 {term}
 </button>
 ))}
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
 <style>{`
 @keyframes marquee {
 0% { transform: translateX(0%); }
 100% { transform: translateX(-50%); }
 }
 .animate-marquee {
 animation: marquee 20s linear infinite;
 }
 `}</style>
 </section>

 <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-8 flex flex-col gap-12">
 
  {/* Promotional Banner */}
  <PromoBanner />

 {/* Categories Row */}
 <div className="flex flex-col gap-6 w-full">
 <h3 className="font-title-md text-2xl text-on-surface font-bold">Kategori Populer</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
 {categories.slice(0, 6).map((cat, idx) => {
 const themeColors = [
 { base: 'primary', hex: 'from-primary/10 to-primary/30', border: 'hover:border-primary/20', text: 'text-primary' },
 { base: 'secondary', hex: 'from-secondary/10 to-secondary/30', border: 'hover:border-secondary/20', text: 'text-secondary' },
 { base: 'tertiary', hex: 'from-tertiary/10 to-tertiary/30', border: 'hover:border-tertiary/20', text: 'text-tertiary' },
 { base: 'surface-tint', hex: 'from-surface-tint/10 to-surface-tint/30', border: 'hover:border-surface-tint/20', text: 'text-surface-tint' },
 { base: 'error', hex: 'from-error/10 to-error/30', border: 'hover:border-error/20', text: 'text-error' },
 { base: 'outline', hex: 'from-outline/10 to-outline/30', border: 'hover:border-outline/20', text: 'text-outline' },
 ];
 const theme = themeColors[idx % themeColors.length];
 
 return (
 <button 
 key={cat.id}
 onClick={() => setKategori(cat.name)}
 className={`glass-panel rounded-2xl p-6 flex flex-col items-center gap-4 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group border-2 border-transparent ${theme.border} bg-surface/50 text-center w-full`}
 >
 <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${theme.hex} flex items-center justify-center ${theme.text} group-hover:scale-110 transition-transform shadow-inner`}>
 <span className="material-symbols-outlined text-[32px]">{getCategoryIcon(cat.name)}</span>
 </div>
 <span className="font-title-md text-base text-on-surface font-bold capitalize line-clamp-1">{cat.name.replace('_', ' ')}</span>
 </button>
 );
 })}
 </div>
 </div>

 {/* Rekomendasi Section (Grid Items) */}
 <div className="flex flex-col gap-6 w-full relative z-20">
 <div className="flex justify-between items-end border-b border-outline-variant/20 pb-4">
 <h3 className="font-display-lg text-3xl text-on-surface font-extrabold">Hasil Pencarian</h3>
 <div className="font-label-md text-primary bg-primary/5 px-4 py-2 rounded-full">
 {items.length} Barang Ditemukan
 </div>
 </div>

 {isLoading ? (
 <div className="flex justify-center py-20">
 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
 </div>
 ) : items.length === 0 ? (
 <div className="text-center py-20 bg-surface rounded-3xl shadow-sm border border-outline-variant/20">
 <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mx-auto mb-4">
 <span className="material-symbols-outlined text-[32px] text-outline">search_off</span>
 </div>
 <h3 className="text-xl font-bold text-on-surface">Tidak ada barang</h3>
 <p className="text-on-surface-variant mt-2">Coba ubah kata kunci pencarian atau filter.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
 {items.map(item => (
 <Link to={`/items/${item.id}`} key={item.id} className="group bg-surface rounded-2xl overflow-hidden flex flex-col hover:-translate-y-2 transition-all duration-300 shadow-md hover:shadow-2xl border border-outline-variant/10 relative h-full">
 <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-high">
 {item.fotoBarang ? (
 <img
 src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`}
 alt={item.namaBarang}
 className={`object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ${item.stok <= 0 || item.statusBarang === 'DIPINJAM' ? 'grayscale-[30%] opacity-80' : ''}`}
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-outline">
 <span className="material-symbols-outlined text-[48px]">image</span>
 </div>
 )}

 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
 
 {(item.stok <= 0 || item.statusBarang === 'DIPINJAM') && (
 <div className="absolute inset-0 bg-surface/30 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
 <span className="px-4 py-2 rounded-xl bg-surface/95 text-on-surface font-label-md font-bold shadow-lg backdrop-blur-md border border-outline-variant/20">
 Sedang Dipinjam
 </span>
 </div>
 )}

 <button 
    className={`absolute top-3 right-3 p-1.5 z-20 transition-colors ${wishlists.includes(item.id) ? 'text-error' : 'text-white drop-shadow-md hover:text-error'}`} 
    onClick={(e) => handleWishlistToggle(e, item.id)}
    title={wishlists.includes(item.id) ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
 >
    <span className="material-symbols-outlined text-[16px]" style={wishlists.includes(item.id) ? {fontVariationSettings: "'FILL' 1"} : {}}>
        {wishlists.includes(item.id) ? 'favorite' : 'favorite_border'}
    </span>
 </button>
 
 <div className="absolute top-3 left-3 bg-surface/95 backdrop-blur-md rounded-lg px-2 py-0.5 text-[10px] font-bold text-primary shadow-sm flex items-center z-20 tracking-wide uppercase">
 {item.kategori.replace('_', ' ')}
 </div>
 
 <div className="absolute bottom-3 right-3 bg-surface/90 backdrop-blur-md rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-on-surface shadow-sm flex items-center gap-0.5 z-20">
 <span className="material-symbols-outlined text-[12px] text-tertiary-fixed-dim" style={{ fontVariationSettings:"'FILL' 1" }}>star</span>
 {(4.8 + Math.random() * 0.2).toFixed(1)} <span className="font-normal text-on-surface-variant opacity-80">({Math.floor(Math.random() * 50) + 1})</span>
 </div>
 </div>

 <div className={`p-5 flex flex-col flex-grow relative bg-surface z-10 ${item.stok <= 0 || item.statusBarang === 'DIPINJAM' ? 'opacity-80' : ''}`}>
 <div className="flex items-center gap-2 mb-2">
 {item.owner?.universitas && (
 <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary truncate max-w-[80px]">
 {item.owner.universitas}
 </span>
 )}
 <div className="flex items-center text-outline font-label-sm truncate">
 <span className="material-symbols-outlined text-[14px] mr-1">location_on</span>
 <span className="truncate">{item.lokasiPengambilan}</span>
 {item.distance !== undefined && item.distance !== null && (
 <span className="text-primary font-semibold ml-1">
 ({item.distance < 1 ? '< 1 km' : `${Math.round(item.distance)} km`})
 </span>
 )}
 </div>
 </div>
 
 <h3 className="font-title-md text-lg text-on-surface font-bold line-clamp-2 leading-snug mb-3 group-hover:text-primary transition-colors">
 {item.namaBarang}
 </h3>

 <div className="flex items-center gap-2 mb-4 mt-auto">
 <div className="w-6 h-6 rounded-full bg-surface-variant overflow-hidden flex-shrink-0 flex items-center justify-center">
 {item.owner?.fotoProfil ? (
 <img src={`${UPLOADS_URL}${item.owner.fotoProfil}`} alt="User avatar" className="w-full h-full object-cover" />
 ) : (
 <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
 )}
 </div>
 <span className="font-label-sm text-on-surface-variant truncate">{item.owner?.nama || 'Pengguna'}</span>
 {item.owner?.role === 'ADMIN' && (
 <span className="material-symbols-outlined text-[14px] text-secondary" style={{ fontVariationSettings:"'FILL' 1" }} title="Verified Owner">verified</span>
 )}
 </div>
 
 <div className="pt-3 border-t border-outline-variant/20 flex items-end justify-between">
 <div className="font-title-md text-xl text-primary font-bold">
 {item.hargaSewa === 0 ? 'Gratis' : `Rp ${item.hargaSewa.toLocaleString('id-ID')}`}
 {item.hargaSewa !== 0 && <span className="text-label-sm font-normal text-outline">/hari</span>}
 </div>
 </div>
 </div>
 </Link>
 ))}
 </div>
 )}

 {/* Pagination / Load More */}
 {items.length > 0 && (
 <div className="flex justify-center mt-4 pb-8">
 <button className="px-8 py-3.5 rounded-full border-2 border-primary/20 text-primary font-title-md font-bold hover:bg-primary/5 hover:border-primary transition-all flex items-center gap-2">
 Muat Lebih Banyak
 <span className="material-symbols-outlined text-[20px]">expand_more</span>
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default Items;
