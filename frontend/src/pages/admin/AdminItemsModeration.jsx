import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const AdminItemsModeration = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua Kategori');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  
  const [banModal, setBanModal] = useState({ isOpen: false, item: null });

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getItems();
      setItems(res.data);
    } catch (err) {
      toast.error('Gagal memuat data barang');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleBanConfirm = async () => {
    if (!banModal.item) return;
    try {
      await adminService.toggleItemBan(banModal.item.id);
      toast.success('Status barang berhasil diubah');
      fetchItems();
      setBanModal({ isOpen: false, item: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.namaBarang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.owner?.nama?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'Semua Kategori' || item.kategori === filterCategory;
    
    let matchesStatus = true;
    if (filterStatus === 'Banned') matchesStatus = item.isBanned;
    else if (filterStatus === 'Tersedia') matchesStatus = !item.isBanned && item.stok > 0;
    else if (filterStatus === 'Habis/Dipinjam') matchesStatus = !item.isBanned && item.stok === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = items.length;
  const bannedItems = items.filter(i => i.isBanned).length;

  const uniqueCategories = ['Semua Kategori', ...new Set(items.map(i => i.kategori).filter(Boolean))];

  return (
    <div className="flex flex-col gap-stack-lg max-w-container-max mx-auto w-full">
      <style>{`
        .glass-panel {
          background: rgba(248, 249, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      {/* Header & Stats Area */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">Moderasi Barang</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Pantau dan kelola seluruh inventaris barang di platform.</p>
        </div>
        <div className="flex gap-stack-sm">
          <div className="bg-surface-container-lowest glass-panel px-6 py-4 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col items-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant/60 tracking-widest">Total Barang</span>
            <span className="text-2xl font-black text-primary">{totalItems}</span>
          </div>
          <div className="bg-surface-container-lowest glass-panel px-6 py-4 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col items-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant/60 tracking-widest">Diberi Sanksi</span>
            <span className="text-2xl font-black text-error">{bannedItems}</span>
          </div>
        </div>
      </header>

      {/* Filters & Search Toolbar */}
      <section className="bg-surface-container-lowest glass-panel p-stack-md rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
          <input 
            className="w-full pl-12 pr-4 py-3 bg-surface-bright border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-on-surface" 
            placeholder="Cari nama barang atau pemilik..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-stack-sm overflow-x-auto pb-1 md:pb-0">
          <select 
            className="bg-surface-bright border-outline-variant rounded-xl px-4 py-3 font-label-md text-on-surface focus:border-primary focus:ring-0"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            className="bg-surface-bright border-outline-variant rounded-xl px-4 py-3 font-label-md text-on-surface focus:border-primary focus:ring-0"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Tersedia">Tersedia</option>
            <option value="Habis/Dipinjam">Habis/Dipinjam</option>
            <option value="Banned">Banned</option>
          </select>
          <button 
            onClick={() => { setSearchTerm(''); setFilterCategory('Semua Kategori'); setFilterStatus('Semua Status'); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface-variant font-label-md rounded-xl hover:bg-surface-container-highest transition-colors active:scale-95 duration-150"
          >
            <span className="material-symbols-outlined">filter_list</span>
            Reset
          </button>
        </div>
      </section>

      {/* Data Grid */}
      <div className="bg-surface-container-lowest glass-panel rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Info Barang</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Harga/Hari</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-center">Stok</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredItems.map(item => (
                  <tr key={item.id} className={`transition-colors group ${item.isBanned ? 'bg-error-container/5 hover:bg-error-container/10' : 'hover:bg-surface-container-low'}`}>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-4 ${item.isBanned ? 'opacity-70' : ''}`}>
                        <div className={`w-14 h-14 rounded-xl overflow-hidden shadow-sm border ${item.isBanned ? 'border-error/20 grayscale' : 'border-outline-variant/10'}`}>
                          {item.fotoBarang ? (
                            <img src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} alt={item.namaBarang} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-surface-container text-outline">
                              <span className="material-symbols-outlined text-2xl">image_not_supported</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className={`font-title-md text-[16px] text-on-surface leading-tight max-w-[200px] truncate ${item.isBanned ? 'line-through' : ''}`}>
                            {item.namaBarang}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {item.isBanned ? (
                              <span className="text-xs text-error font-bold">Melanggar S&K</span>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-[14px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                                <span className="text-xs text-on-surface-variant">Oleh: {item.owner?.nama}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${
                        item.kategori === 'Elektronik' ? 'bg-secondary-container/30 text-on-secondary-container' : 
                        item.kategori === 'Alat Musik' ? 'bg-tertiary-container/30 text-on-tertiary-container' :
                        'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {item.kategori || 'Lainnya'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-label-md font-bold ${item.isBanned ? 'text-on-surface-variant' : 'text-primary'}`}>
                        Rp{item.hargaSewa.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-body-md text-on-surface-variant">{item.stok}</span>
                    </td>
                    <td className="px-6 py-4">
                      {item.isBanned ? (
                        <div className="flex items-center gap-2 text-error">
                          <span className="material-symbols-outlined text-[18px]">report</span>
                          <span className="font-label-md font-bold uppercase tracking-tight">Banned</span>
                        </div>
                      ) : item.stok > 0 ? (
                        <div className="flex items-center gap-2 text-secondary">
                          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                          <span className="font-label-md">Tersedia</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-tertiary">
                          <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                          <span className="font-label-md">Habis/Dipinjam</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {item.isBanned ? (
                        <button 
                          onClick={() => setBanModal({ isOpen: true, item })}
                          className="p-2 text-error bg-error/10 rounded-lg transition-colors shadow-sm"
                          title="Restore"
                        >
                          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>lock_open</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => setBanModal({ isOpen: true, item })}
                          className="p-2 text-on-surface-variant hover:bg-error/10 hover:text-error rounded-lg transition-colors"
                          title="Ban"
                        >
                          <span className="material-symbols-outlined">block</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-on-surface-variant">Barang tidak ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Ban Modal */}
      {banModal.isOpen && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest glass-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-fade-in">
            <div className="p-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${banModal.item.isBanned ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                <span className="material-symbols-outlined text-[32px]">{banModal.item.isBanned ? 'lock_open' : 'warning'}</span>
              </div>
              <h3 className="font-headline-lg text-[24px] text-on-background mb-2">Konfirmasi Tindakan</h3>
              <p className="font-body-md text-on-surface-variant">
                {banModal.item.isBanned 
                  ? `Apakah Anda yakin ingin membatalkan sanksi untuk "${banModal.item.namaBarang}"? Barang akan kembali tersedia di katalog publik.`
                  : `Apakah Anda yakin ingin memberikan sanksi (Ban) pada "${banModal.item.namaBarang}"? Pemilik barang akan mendapatkan notifikasi otomatis.`
                }
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface-container-low border-t border-outline-variant/10">
              <button 
                className="px-6 py-2.5 font-label-md text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors" 
                onClick={() => setBanModal({ isOpen: false, item: null })}
              >
                Batal
              </button>
              <button 
                className={`px-6 py-2.5 font-label-md text-white rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all ${banModal.item.isBanned ? 'bg-primary shadow-primary/20' : 'bg-error shadow-error/20'}`} 
                onClick={handleToggleBanConfirm}
              >
                {banModal.item.isBanned ? 'Ya, Aktifkan Kembali' : 'Ya, Berikan Sanksi'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default AdminItemsModeration;
