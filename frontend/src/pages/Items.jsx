// src/pages/Items.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Clock, Tag, GraduationCap } from 'lucide-react';
import itemService from '../services/item.service';
import categoryService from '../services/category.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const Items = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);
  
  // Filters
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('Semua');
  const [status, setStatus] = useState('Semua');
  const [universitas, setUniversitas] = useState('');

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (kategori !== 'Semua') params.kategori = kategori;
      if (status !== 'Semua') params.status = status;
      if (universitas) params.universitas = universitas;
      
      const res = await itemService.getItems(params);
      setItems(res.data || []);
    } catch (err) {
      toast.error('Gagal memuat daftar barang');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const delay = setTimeout(() => {
      fetchItems();
    }, 200);
    return () => clearTimeout(delay);
  }, [search, kategori, status, universitas]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="page-container">
        {/* Header & Search */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Eksplorasi Barang</h1>
          <p className="text-gray-500 dark:text-slate-400">Temukan barang yang kamu butuhkan untuk menunjang perkuliahanmu.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 mb-8 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama barang..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Kategori */}
          <div className="w-full md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
            <select 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none text-sm dark:text-white"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map(k => (
                <option key={k.id} value={k.name}>{k.name.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Filter Universitas */}
          <div className="w-full md:w-64 relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Asal Universitas..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm dark:text-white"
              value={universitas}
              onChange={(e) => setUniversitas(e.target.value)}
            />
          </div>

          {/* Filter Status */}
          <div className="w-full md:w-48">
            <select 
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none text-sm dark:text-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Semua">Semua Status</option>
              <option value="TERSEDIA">Tersedia</option>
              <option value="DIPINJAM">Dipinjam</option>
            </select>
          </div>
        </div>

        {/* Grid Items */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Tidak ada barang</h3>
            <p className="text-gray-500 mt-1 text-sm">Coba ubah kata kunci pencarian atau filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
              <Link to={`/items/${item.id}`} key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-slate-700 group flex flex-col hover:border-blue-200 dark:hover:border-slate-600">
                {/* Image */}
                <div className="aspect-[4/3] bg-gray-100 dark:bg-slate-700 relative overflow-hidden">
                  {item.fotoBarang ? (
                    <img 
                      src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} 
                      alt={item.namaBarang} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <Tag size={12} />
                      {item.kategori.replace('_', ' ')}
                    </div>
                    {item.owner?.universitas && (
                      <div className="flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
                        <GraduationCap size={12} />
                        {item.owner.universitas}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 truncate" title={item.namaBarang}>
                    {item.namaBarang}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 flex-1">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span className="line-clamp-2">{item.lokasiPengambilan}</span>
                  </div>

                  <div className="flex items-end justify-between pt-3 border-t border-gray-100 dark:border-slate-700 mt-auto">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">Sewa</p>
                      <p className="font-bold text-gray-900 dark:text-slate-100">
                        {item.hargaSewa === 0 ? 'Gratis' : `Rp ${item.hargaSewa.toLocaleString('id-ID')}`}
                        <span className="text-xs font-normal text-gray-500 dark:text-slate-400">/hari</span>
                      </p>
                    </div>
                    <div className="text-xs text-right text-gray-500">
                      {item.stok <= 0 || item.statusBarang === 'DIPINJAM' ? 'Habis/Disewa' : `Stok: ${item.stok}`}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;
