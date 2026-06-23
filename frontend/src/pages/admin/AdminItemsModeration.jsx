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
    <div className="animate-fade-in max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-label-sm">Dashboard</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-label-sm font-semibold text-primary">Items Moderation</span>
          </nav>
          <h2 className="font-headline-md text-headline-md text-on-background">Items Moderation</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Review, flag, or restore rental items across the campus ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-label-md rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Overview - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-8">
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">inventory</span>
            </div>
          </div>
          <p className="text-on-surface-variant font-label-md">Total Items</p>
          <h3 className="text-headline-md font-bold text-on-surface mt-1">{totalItems}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
          <p className="text-on-surface-variant font-label-md">Active Listings</p>
          <h3 className="text-headline-md font-bold text-on-surface mt-1">{activeItems}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined">block</span>
            </div>
          </div>
          <p className="text-on-surface-variant font-label-md">Banned Items</p>
          <h3 className="text-headline-md font-bold text-on-surface mt-1">{bannedItems}</h3>
        </div>
      </div>

      {/* Items Table Container */}
      <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
        <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 bg-surface-container-low p-1 rounded-lg">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-label-md transition-colors ${filterType === 'all' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              All Items
            </button>
            <button 
              onClick={() => setFilterType('active')}
              className={`px-4 py-2 rounded-lg font-label-md transition-colors ${filterType === 'active' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilterType('banned')}
              className={`px-4 py-2 rounded-lg font-label-md transition-colors ${filterType === 'banned' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              Banned
            </button>
          </div>
          
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-body-md"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Photo</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Item Name</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Category</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Owner</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Price/Day</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-on-surface-variant">No items found.</td>
                </tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden border border-outline-variant">
                      {item.fotoBarang ? (
                        <img src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} alt={item.namaBarang} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined">image_not_supported</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[200px]">
                      <p className="font-body-lg font-semibold text-on-surface">{item.namaBarang}</p>
                      <p className="text-label-sm text-on-surface-variant truncate">Stok: {item.stok}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container text-[12px] font-semibold">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-container text-white flex items-center justify-center text-[10px] font-bold">
                        {item.owner.nama ? item.owner.nama.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-body-md text-on-surface">{item.owner.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-on-surface">Rp {item.hargaSewa.toLocaleString('id-ID')}</p>
                  </td>
                  <td className="px-6 py-4">
                    {item.isBanned ? (
                      <div className="flex items-center gap-1.5 text-error">
                        <div className="w-2 h-2 rounded-full bg-error"></div>
                        <span className="text-label-sm font-bold">Banned</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-tertiary">
                        <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                        <span className="text-label-sm font-bold">Active</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleBan(item.id)}
                      className={`px-4 py-1.5 font-label-sm rounded-full transition-colors shadow-sm ${
                        item.isBanned 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      {item.isBanned ? 'Restore' : 'Hide'}
                    </button>
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
