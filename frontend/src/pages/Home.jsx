import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import categoryService from '../services/category.service';
import itemService from '../services/item.service';
import {
  Search,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const Home = () => {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  useEffect(() => {
    categoryService.getCategories().then(res => {
      if (Array.isArray(res.data)) setCategories(res.data);
    }).catch(console.error);

    itemService.getItems({ limit: 4, status: 'TERSEDIA' }).then(res => {
      if (Array.isArray(res.data)) {
        setPopularItems(res.data.slice(0, 4));
      }
    }).catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/items?${params.toString()}`);
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] min-h-screen">
      
      {/* ════ VIBRANT HERO SECTION ════ */}
      <section className="relative pt-24 pb-32 px-4 flex items-center justify-center min-h-[90vh]">
        {/* Dynamic Mesh Gradients Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Temukan Barang Impianmu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Dengan Lebih Mudah
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Platform pertukaran barang terpercaya. Tukar barang lama kamu dengan barang baru yang lebih bermanfaat.
          </p>

          {/* Premium Search Widget */}
          <div className="relative z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-3 md:p-4 rounded-3xl md:rounded-full max-w-4xl mx-auto shadow-[0_20px_60px_-15px_rgba(37,99,235,0.2)] border border-white/60 dark:border-slate-700/50 transform hover:scale-[1.01] transition-transform duration-300 text-left">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 relative">
              
              {/* Custom Dropdown */}
              <div className="relative w-full md:w-[220px]">
                <div 
                  className="bg-transparent text-slate-700 dark:text-slate-200 font-medium cursor-pointer px-4 h-full min-h-[48px] flex items-center justify-between rounded-full hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="truncate">
                    {selectedCategory 
                      ? categories.find(c => c.name.toLowerCase() === selectedCategory)?.name.replace('_', ' ') || 'Semua Kategori'
                      : 'Semua Kategori'}
                  </span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div 
                      className={`px-4 py-3 cursor-pointer transition-colors ${!selectedCategory ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-white font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                      onClick={() => {
                        setSelectedCategory('');
                        setIsDropdownOpen(false);
                      }}
                    >
                      Semua Kategori
                    </div>
                    {categories.map(cat => (
                      <div 
                        key={cat.id} 
                        className={`px-4 py-3 cursor-pointer transition-colors ${selectedCategory === cat.name.toLowerCase() ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-white font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                        onClick={() => {
                          setSelectedCategory(cat.name.toLowerCase());
                          setIsDropdownOpen(false);
                        }}
                      >
                        {cat.name.replace('_', ' ')}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700 my-auto" />
              <div className="flex-1 flex items-center px-4">
                <Search className="w-5 h-5 text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Cari barang..." 
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl md:rounded-full font-semibold transition-all shadow-lg shadow-blue-500/20"
              >
                Cari
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ════ CATEGORIES SECTION ════ */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Jelajahi Kategori</h2>
          <div className="flex overflow-x-auto pb-6 gap-4">
            {categories.map((cat) => (
              <Link 
                key={cat.id}
                to={`/items?category=${cat.name.toLowerCase()}`}
                className="flex-shrink-0 flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all hover:border-blue-500/30"
              >
                <span className="material-symbols-outlined text-3xl text-blue-500">{cat.icon || 'category'}</span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white capitalize block">{cat.name.replace('_', ' ')}</span>
                  <span className="text-sm font-semibold text-slate-500">{cat.itemCount ?? 0} Items</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════ POPULAR ITEMS ════ */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Populer</h2>
            <Link to="/items" className="text-blue-600 font-semibold flex items-center hover:gap-2 transition-all">
              Lihat semua <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularItems.map((item) => (
              <Link to={`/items/${item.id}`} key={item.id} className="group bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-900 relative">
                  {item.fotoBarang ? (
                    <img 
                      src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} 
                      alt={item.namaBarang} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl font-bold text-slate-900 dark:text-white shadow-lg">
                    {item.hargaSewa === 0 ? 'Gratis' : `Rp ${item.hargaSewa.toLocaleString('id-ID')}`}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{item.namaBarang}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{item.lokasiPengambilan}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
