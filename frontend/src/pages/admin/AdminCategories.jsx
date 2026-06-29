import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import categoryService from '../../services/category.service';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const ICON_OPTIONS = [
  'category', 'inventory_2', 'laptop', 'school', 'sports_esports',
  'home', 'kitchen', 'chair', 'watch', 'camera_alt',
  'menu_book', 'hiking', 'sports_soccer', 'music_note', 'palette',
];

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('category');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, itemsRes] = await Promise.all([
        categoryService.getCategories(),
        adminService.getItems()
      ]);
      setCategories(catRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      toast.error('Gagal memuat data kategori');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmitting(true);
    try {
      await categoryService.createCategory({ name: newCatName, icon: newCatIcon, description: newCatDesc });
      toast.success('Kategori berhasil ditambahkan!');
      setNewCatName('');
      setNewCatDesc('');
      setNewCatIcon('category');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error('Gagal menambahkan kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Yakin ingin menghapus kategori "${name}"?`)) {
      try {
        await categoryService.deleteCategory(id);
        toast.success('Kategori berhasil dihapus');
        fetchData();
      } catch (error) {
        toast.error('Gagal menghapus kategori');
      }
    }
  };

  const handleViewItems = (cat) => {
    setSelectedCategory(cat);
    setShowItemsModal(true);
  };

  const getItemCount = (catName) =>
    items.filter(i => i.kategori?.toUpperCase() === catName?.toUpperCase()).length;

  const getCategoryItems = (catName) =>
    items.filter(i => i.kategori?.toUpperCase() === catName?.toUpperCase());

  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = items.length;

  return (
    <div className="flex flex-col gap-stack-lg max-w-container-max mx-auto w-full pb-stack-xl">
      <style>{`
        .glass-panel {
          background: rgba(248, 249, 255, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-stack-xs">Manajemen Kategori</h2>
          <p className="text-body-md text-on-surface-variant">Kelola pengelompokan barang untuk mempermudah pencarian.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span className="text-label-md">Kategori Baru</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-md">
        <div className="glass-panel p-stack-md rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">category</span>
            </div>
          </div>
          <p className="font-display-lg text-[32px] font-extrabold text-on-surface leading-tight">{categories.length}</p>
          <p className="text-label-sm text-on-surface-variant mt-1">Total Kategori</p>
        </div>
        <div className="glass-panel p-stack-md rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
          </div>
          <p className="font-display-lg text-[32px] font-extrabold text-on-surface leading-tight">{totalItems}</p>
          <p className="text-label-sm text-on-surface-variant mt-1">Total Barang</p>
        </div>
        <div className="glass-panel p-stack-md rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">analytics</span>
            </div>
          </div>
          <p className="font-display-lg text-[32px] font-extrabold text-on-surface leading-tight">
            {categories.length > 0 ? (totalItems / categories.length).toFixed(1) : '0'}
          </p>
          <p className="text-label-sm text-on-surface-variant mt-1">Rata-rata Barang/Kategori</p>
        </div>
        <div className="glass-panel p-stack-md rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-error-container/20 flex items-center justify-center text-error">
              <span className="material-symbols-outlined">report_problem</span>
            </div>
          </div>
          <p className="font-display-lg text-[32px] font-extrabold text-on-surface leading-tight">
            {categories.filter(c => getItemCount(c.name) === 0).length}
          </p>
          <p className="text-label-sm text-on-surface-variant mt-1">Kategori Kosong</p>
        </div>
      </div>

      {/* Categories List Card */}
      <div className="glass-panel rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden mt-2">
        <div className="px-6 py-4 border-b border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-surface-container-low/50 gap-4">
          <h3 className="font-title-md text-title-md text-on-surface">Daftar Kategori</h3>
          <div className="relative w-full sm:max-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Cari kategori..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-bright border border-outline-variant/50 rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10">
                  <th className="px-6 py-4 font-bold">Kategori & Ikon</th>
                  <th className="px-6 py-4 font-bold">Deskripsi</th>
                  <th className="px-6 py-4 font-bold">Jumlah Barang</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">category</span>
                      <p>Kategori tidak ditemukan</p>
                    </td>
                  </tr>
                ) : filteredCategories.map(cat => {
                  const count = getItemCount(cat.name);
                  return (
                    <tr key={cat.id} className="hover:bg-primary-container/5 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary border border-primary-container/20">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>{cat.icon || 'category'}</span>
                          </div>
                          <div>
                            <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{cat.name}</p>
                            <p className="text-[12px] text-on-surface-variant">ID: #{cat.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 max-w-[200px]">
                        <span className="text-sm text-on-surface-variant truncate block">{cat.description || '-'}</span>
                      </td>
                      <td className="px-6 py-5">
                        <button 
                          onClick={() => handleViewItems(cat)}
                          className="flex items-center gap-1.5 font-medium text-primary hover:underline"
                        >
                          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                          {count} Barang
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          count > 0 ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'
                        }`}>
                          {count > 0 ? 'Aktif' : 'Kosong'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleViewItems(cat)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all" 
                            title="Lihat Barang"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all" 
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trust Badge Contextual Info */}
      <div className="mt-4 p-stack-lg glass-panel rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row items-center gap-stack-lg">
        <div className="w-16 h-16 rounded-2xl bg-secondary-container/30 flex items-center justify-center text-secondary shrink-0">
          <span className="material-symbols-outlined text-[32px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-title-md text-on-surface">Penyusunan Kategori</h4>
          <p className="text-body-md text-on-surface-variant mt-1">Gunakan ikon dan penamaan kategori yang intuitif agar mahasiswa mudah mencari barang yang dibutuhkan.</p>
        </div>
      </div>

      {/* ADD CATEGORY MODAL */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest glass-panel rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in border border-outline-variant/20">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 bg-surface-bright">
              <h3 className="font-headline-lg text-[20px] text-on-surface">Tambah Kategori Baru</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Nama Kategori <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Misal: Elektronik, Olahraga..."
                  required
                  className="w-full bg-surface-bright border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Deskripsi</label>
                <textarea 
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Deskripsi singkat..."
                  rows="3"
                  className="w-full bg-surface-bright border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none text-on-surface"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Pilih Ikon</label>
                <div className="grid grid-cols-5 gap-2">
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCatIcon(icon)}
                      className={`p-3 rounded-xl flex items-center justify-center transition-all border ${
                        newCatIcon === icon 
                        ? 'bg-primary text-white border-primary shadow-md' 
                        : 'bg-surface-container text-on-surface-variant border-transparent hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newCatName.trim()}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* VIEW ITEMS MODAL */}
      {showItemsModal && selectedCategory && createPortal(
        <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest glass-panel rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[85vh] border border-outline-variant/20">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 bg-surface-bright shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">{selectedCategory.icon || 'category'}</span>
                </div>
                <div>
                  <h3 className="font-headline-lg text-[18px] text-on-surface">{selectedCategory.name}</h3>
                  <p className="text-sm text-on-surface-variant">{getItemCount(selectedCategory.name)} barang dalam kategori ini</p>
                </div>
              </div>
              <button 
                onClick={() => setShowItemsModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-0">
              {getCategoryItems(selectedCategory.name).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-50">inventory_2</span>
                  <p className="font-medium">Tidak ada barang dalam kategori ini</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low sticky top-0">
                    <tr className="text-[12px] text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10">
                      <th className="px-6 py-3 font-bold">Barang</th>
                      <th className="px-6 py-3 font-bold">Pemilik</th>
                      <th className="px-6 py-3 font-bold">Harga/Hari</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {getCategoryItems(selectedCategory.name).map(item => (
                      <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container shrink-0 border border-outline-variant/20">
                              {item.fotoBarang ? (
                                <img src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} alt={item.namaBarang} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-outline">
                                  <span className="material-symbols-outlined text-[18px]">image</span>
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-on-surface text-sm">{item.namaBarang}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-on-surface-variant">{item.owner?.nama || '-'}</td>
                        <td className="px-6 py-3 text-sm font-bold text-primary">Rp {item.hargaSewa?.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.isBanned ? 'bg-error-container text-on-error-container' : 
                            item.stok > 0 ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-container text-on-tertiary-container'
                          }`}>
                            {item.isBanned ? 'Banned' : item.stok > 0 ? 'Tersedia' : 'Habis'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminCategories;
