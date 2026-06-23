// src/pages/MyItems.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Box } from 'lucide-react';
import itemService from '../services/item.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const MyItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyItems = async () => {
    setIsLoading(true);
    try {
      const res = await itemService.getItems({ ownerId: user.id });
      setItems(res.data || []);
    } catch (err) {
      toast.error('Gagal memuat barang kamu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, [user.id]);

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus barang ini?')) return;
    try {
      await itemService.deleteItem(id);
      toast.success('Barang berhasil dihapus');
      fetchMyItems();
    } catch (err) {
      toast.error('Gagal menghapus barang');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Barang Saya</h1>
            <p className="text-gray-500 dark:text-slate-400">Kelola barang yang kamu sewakan/pinjamkan.</p>
          </div>
          <Link to="/my-items/create" className="btn-primary py-2.5 px-6 flex items-center gap-2">
            <Plus size={18} />
            Tambah Barang
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Box className="text-blue-500 dark:text-blue-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Belum ada barang</h3>
            <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm mb-6">Mulai tambahkan barang pertamamu untuk disewakan.</p>
            <Link to="/my-items/create" className="btn-secondary py-2 px-5 inline-flex">Tambah Barang</Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Barang</th>
                    <th className="p-4 font-semibold">Kategori</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                            {item.fotoBarang ? (
                              <img src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} alt={item.namaBarang} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500"><Box size={16} /></div>
                            )}
                          </div>
                          <div>
                            <Link to={`/items/${item.id}`} className="font-semibold text-gray-900 dark:text-slate-100 hover:text-blue-600 truncate max-w-[200px] block" title={item.namaBarang}>
                              {item.namaBarang}
                            </Link>
                            <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">Rp {item.hargaSewa.toLocaleString('id-ID')}/hari</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-slate-300">{item.kategori.replace('_', ' ')}</td>
                      <td className="p-4">
                        {item.statusBarang === 'TERSEDIA' ? (
                          <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-lg shadow-sm">Tersedia</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-semibold rounded-lg shadow-sm">{item.statusBarang}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/my-items/edit/${item.id}`} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </Link>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyItems;
