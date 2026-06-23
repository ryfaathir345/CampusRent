// src/pages/Wishlist.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, PackageSearch, Tag, MapPin, Trash2 } from 'lucide-react';
import wishlistService from '../services/wishlist.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const Wishlist = () => {
  const [wishlists, setWishlists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistService.getWishlists();
      setWishlists(res.data);
    } catch (err) {
      toast.error('Gagal memuat wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await wishlistService.toggleWishlist(itemId);
      setWishlists(prev => prev.filter(w => w.itemId !== itemId));
      toast.success('Dihapus dari wishlist');
    } catch (err) {
      toast.error('Gagal menghapus wishlist');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="text-red-500 fill-current" size={28} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Wishlist Saya</h1>
        </div>

        {wishlists.length === 0 ? (
          <div className="text-center bg-white dark:bg-slate-800 rounded-3xl p-16 border border-gray-100 dark:border-slate-700 shadow-sm">
            <Heart className="mx-auto text-gray-300 dark:text-slate-600 mb-4" size={64} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">Wishlist Kosong</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-md mx-auto">Anda belum menyimpan barang apapun ke dalam wishlist. Jelajahi barang-barang menarik sekarang!</p>
            <Link to="/items" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              <PackageSearch size={20} />
              Jelajahi Barang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlists.map((w) => {
              const item = w.item;
              return (
                <div key={w.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-slate-700 flex flex-col group relative">
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 text-red-500 rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"
                    title="Hapus dari wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                  <Link to={`/items/${item.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-slate-700">
                    {item.fotoBarang ? (
                      <img src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} alt={item.namaBarang} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                        <PackageSearch size={40} className="mb-2 opacity-50" />
                        <span className="text-sm font-medium">Tanpa Foto</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300 shadow-sm">
                      <Tag size={12} className="text-blue-500" />
                      <span className="truncate max-w-[100px]">{item.kategori.replace('_', ' ')}</span>
                    </div>
                  </Link>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Link to={`/items/${item.id}`}>{item.namaBarang}</Link>
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 text-sm mb-3">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span className="truncate">{item.lokasiPengambilan}</span>
                    </div>
                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">
                          {item.hargaSewa === 0 ? 'Gratis' : `Rp ${item.hargaSewa.toLocaleString('id-ID')}`}
                        </span>
                        {item.hargaSewa > 0 && <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">/hari</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
