import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const AdminItemsModeration = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, active, banned

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

  const handleToggleBan = async (itemId) => {
    try {
      await adminService.toggleItemBan(itemId);
      toast.success('Status barang berhasil diubah');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Yakin ingin menghapus barang ini secara permanen? Data transaksi, review, dll yang terkait juga akan dihapus.')) return;
    try {
      await adminService.deleteItem(itemId);
      toast.success('Barang berhasil dihapus secara permanen');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus barang');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.namaBarang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.owner?.nama?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'banned') return matchesSearch && item.isBanned;
    if (filterType === 'active') return matchesSearch && !item.isBanned;
    return matchesSearch;
  });

  const totalItems = items.length;
  const bannedItems = items.filter(i => i.isBanned).length;
  const activeItems = items.filter(i => !i.isBanned).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs">Dashboard</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-xs font-semibold text-brand-500 dark:text-brand-400">Items Moderation</span>
          </nav>
          <h2 className="font-bold text-gray-800 text-title-md dark:text-white/90">Items Moderation</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review, flag, or restore rental items across the campus ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white font-medium text-sm rounded-full shadow-theme-md hover:bg-brand-600 transition-colors">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Overview - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 group hover:shadow-theme-sm transition-all">
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 group-hover:bg-brand-500 group-hover:text-white transition-colors text-gray-800 dark:text-white/90">
              <span className="material-symbols-outlined text-[24px]">inventory</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Total Items</p>
            <h3 className="text-title-md font-bold text-gray-800 dark:text-white/90 mt-1">{totalItems}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 group hover:shadow-theme-sm transition-all">
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 group-hover:bg-success-500 group-hover:text-white transition-colors text-gray-800 dark:text-white/90">
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Active Listings</p>
            <h3 className="text-title-md font-bold text-gray-800 dark:text-white/90 mt-1">{activeItems}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 group hover:shadow-theme-sm transition-all">
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 group-hover:bg-error-500 group-hover:text-white transition-colors text-gray-800 dark:text-white/90">
              <span className="material-symbols-outlined text-[24px]">block</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Banned Items</p>
            <h3 className="text-title-md font-bold text-gray-800 dark:text-white/90 mt-1">{bannedItems}</h3>
          </div>
        </div>
      </div>

      {/* Items Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="p-5 md:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-white dark:bg-gray-900 text-brand-500 shadow-theme-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              All Items
            </button>
            <button 
              onClick={() => setFilterType('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'active' ? 'bg-white dark:bg-gray-900 text-brand-500 shadow-theme-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilterType('banned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'banned' ? 'bg-white dark:bg-gray-900 text-brand-500 shadow-theme-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Banned
            </button>
          </div>
          
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm text-gray-800 dark:text-white/90 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Photo</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price/Day</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No items found.</td>
                </tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                      {item.fotoBarang ? (
                        <img src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} alt={item.namaBarang} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="material-symbols-outlined">image_not_supported</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[200px]">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{item.namaBarang}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Stok: {item.stok}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold">
                        {item.owner.nama ? item.owner.nama.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-sm text-gray-800 dark:text-white/90">{item.owner.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">Rp {item.hargaSewa.toLocaleString('id-ID')}</p>
                  </td>
                  <td className="px-6 py-4">
                    {item.isBanned ? (
                      <div className="flex items-center gap-1.5 text-error-600 dark:text-error-500">
                        <div className="w-2 h-2 rounded-full bg-error-500"></div>
                        <span className="text-xs font-medium">Banned</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-success-600 dark:text-success-500">
                        <div className="w-2 h-2 rounded-full bg-success-500"></div>
                        <span className="text-xs font-medium">Active</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggleBan(item.id)}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
                          item.isBanned 
                          ? 'border border-success-200 text-success-600 hover:bg-success-50 dark:border-success-500/30 dark:text-success-500 dark:hover:bg-success-500/10' 
                          : 'border border-warning-200 text-warning-600 hover:bg-warning-50 dark:border-warning-500/30 dark:text-warning-500 dark:hover:bg-warning-500/10'
                        }`}
                      >
                        {item.isBanned ? 'Restore' : 'Hide'}
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-4 py-1.5 text-xs font-medium rounded-full transition-colors border border-error-200 text-error-600 hover:bg-error-50 dark:border-error-500/30 dark:text-error-500 dark:hover:bg-error-500/10"
                        title="Hapus Permanen"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminItemsModeration;
