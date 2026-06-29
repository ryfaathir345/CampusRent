import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import wishlistService from '../services/wishlist.service';
import itemService from '../services/item.service';
import toast from 'react-hot-toast';
import Sidebar from '../components/common/Sidebar';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const Wishlist = () => {
 const navigate = useNavigate();
 const [wishlists, setWishlists] = useState([]);
 const [recommendations, setRecommendations] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 const fetchData = useCallback(async () => {
  setIsLoading(true);
  try {
   const [wishRes, itemsRes] = await Promise.all([
    wishlistService.getWishlists(),
    itemService.getItems() // fetch all to pick recommendations
   ]);
   const currentWishlists = wishRes.data || [];
   setWishlists(currentWishlists);
   
   // Pick recommendations: items not in wishlist and not owned by user
   // For simplicity, just pick first 3 that are TERSEDIA
   const wishIds = new Set(currentWishlists.map(w => w.itemId));
   const recs = (itemsRes.data || [])
     .filter(i => !wishIds.has(i.id) && i.statusBarang === 'TERSEDIA')
     .slice(0, 3);
   setRecommendations(recs);

  } catch (error) {
   console.error(error);
   toast.error('Gagal memuat data wishlist');
  } finally {
   setIsLoading(false);
  }
 }, []);

 useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchData();
 }, [fetchData]);

 const handleRemove = async (itemId) => {
  try {
   await wishlistService.toggleWishlist(itemId);
   setWishlists(prev => prev.filter(w => w.itemId !== itemId));
   toast.success('Dihapus dari wishlist');
  } catch (error) {
   console.error(error);
   toast.error('Gagal menghapus wishlist');
  }
 };

 return (
  <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md antialiased transition-colors duration-300 dot-pattern">
   <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-stack-xl flex flex-col md:flex-row gap-gutter">
    
    <Sidebar activeTab="wishlist" />

    {/* Content Area */}
    <div className="flex-1 flex flex-col gap-stack-lg min-w-0">
     <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
       <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight font-extrabold">Wishlist Saya</h1>
       <p className="font-body-md text-on-surface-variant">Barang-barang favorit yang ingin Anda sewa nanti.</p>
      </div>
      <div className="bg-primary/10 px-4 py-2 rounded-full h-fit">
       <span className="font-label-md text-primary font-bold">Total: {wishlists.length} Barang</span>
      </div>
     </div>

     {isLoading ? (
      <div className="flex justify-center items-center py-20">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
     ) : wishlists.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-stack-xl mt-stack-xl text-center glass-panel rounded-[2rem] border border-dashed border-outline-variant">
       <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-stack-md">
        <span className="material-symbols-outlined text-5xl text-primary/30" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
       </div>
       <h3 className="font-title-md text-xl mb-2 font-bold">Wishlist masih kosong</h3>
       <p className="font-body-md text-on-surface-variant max-w-sm mb-8">Cari barang-barang menarik dan simpan ke sini untuk disewa kemudian.</p>
       <Link to="/" className="px-8 py-3 bg-primary text-on-primary rounded-xl font-label-md font-bold hover:scale-105 transition-transform">
        Jelajahi Sekarang
       </Link>
      </div>
     ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
       {wishlists.map((w) => {
        const item = w.item;
        return (
         <div key={w.id} className="glass-panel rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300 premium-shadow group border border-outline-variant/10">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-variant">
           {item.fotoBarang ? (
            <img 
             src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} 
             alt={item.namaBarang} 
             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
           ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant opacity-50">
             <span className="material-symbols-outlined text-[40px] mb-2">image</span>
            </div>
           )}
           
           <button 
            onClick={(e) => { e.preventDefault(); handleRemove(item.id); }}
            className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-error shadow-sm hover:bg-error/10 transition-colors z-10"
            title="Hapus dari wishlist"
           >
            <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
           </button>
           
           <div className={`absolute bottom-3 left-3 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] shadow-sm backdrop-blur-md ${item.statusBarang === 'TERSEDIA' ? 'bg-secondary/90 text-white' : 'bg-surface-variant/90 text-on-surface-variant'}`}>
            {item.statusBarang === 'TERSEDIA' ? 'Tersedia' : 'Dipinjam'}
           </div>
          </div>
          
          <div className="p-5 flex flex-col gap-3 flex-grow">
           <div className="flex justify-between items-start gap-2">
            <h3 className="font-title-md text-base font-bold text-on-surface line-clamp-1">
             <Link to={`/items/${item.id}`} className="hover:text-primary transition-colors">{item.namaBarang}</Link>
            </h3>
            <div className="flex items-center gap-1 text-tertiary font-bold text-xs bg-tertiary-fixed/10 px-1.5 py-0.5 rounded">
             <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span> -
            </div>
           </div>
           
           <div className="flex flex-col gap-1">
            <p className="font-body-md text-sm text-secondary font-bold">
             Rp {item.hargaSewa.toLocaleString('id-ID')} <span className="text-on-surface-variant font-normal">/ hari</span>
            </p>
            <div className="flex items-center gap-1.5 text-on-surface-variant mt-1">
             <span className="material-symbols-outlined text-[16px]">location_on</span>
             <span className="font-label-sm text-[12px] truncate">{item.lokasiPengambilan}</span>
            </div>
           </div>
           
           <div className="flex gap-2 mt-auto pt-2">
            <button 
             onClick={() => navigate(`/items/${item.id}`)}
             className="flex-1 bg-primary text-on-primary py-2.5 rounded-xl font-label-md font-bold text-sm hover:bg-primary/90 transition-all shadow-sm"
            >
             Sewa Sekarang
            </button>
            <button 
             onClick={() => navigate(`/items/${item.id}`)}
             className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 hover:bg-surface-variant transition-colors flex items-center justify-center"
             title="Lihat Detail"
            >
             <span className="material-symbols-outlined text-[20px]">visibility</span>
            </button>
           </div>
          </div>
         </div>
        );
       })}
      </div>
     )}

     {/* Recommended Section */}
     {recommendations.length > 0 && (
      <section className="mt-12 flex flex-col gap-6">
       <div className="flex justify-between items-end border-b border-outline-variant/20 pb-4">
        <div>
         <h2 className="font-display-lg text-2xl text-on-surface font-extrabold tracking-tight">Direkomendasikan Untukmu</h2>
         <p className="font-body-md text-sm text-on-surface-variant mt-1">Berdasarkan barang-barang di wishlist kamu.</p>
        </div>
        <div className="flex gap-2">
         <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-colors border border-outline-variant/20">
          <span className="material-symbols-outlined">chevron_left</span>
         </button>
         <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-colors border border-outline-variant/20">
          <span className="material-symbols-outlined">chevron_right</span>
         </button>
        </div>
       </div>
       
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {recommendations.map(rec => (
         <Link key={rec.id} to={`/items/${rec.id}`} className="group bg-surface rounded-2xl overflow-hidden flex flex-col hover:-translate-y-2 transition-all duration-300 border border-outline-variant/10 shadow-sm">
          <div className="relative aspect-square w-full overflow-hidden bg-surface-container-high">
           {rec.fotoBarang ? (
            <img 
             src={`${UPLOADS_URL}${rec.fotoBarang.split(',')[0]}`} 
             alt={rec.namaBarang} 
             className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
            />
           ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant opacity-50">
             <span className="material-symbols-outlined text-[40px] mb-2">image</span>
            </div>
           )}
           <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm">BARU</div>
          </div>
          <div className="p-4 flex flex-col gap-1 bg-surface">
           <h4 className="font-title-md text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">{rec.namaBarang}</h4>
           <p className="text-xs text-secondary font-bold">Rp {rec.hargaSewa.toLocaleString('id-ID')} / hari</p>
          </div>
         </Link>
        ))}
       </div>
      </section>
     )}

    </div>
   </main>
  </div>
 );
};

export default Wishlist;
