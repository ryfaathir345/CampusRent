// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Inbox, AlertTriangle, Bell, Clock, ArrowRight, CheckCircle, Search, MessageCircle } from 'lucide-react';
import transactionService from '../services/transaction.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await transactionService.getDashboardStats();
        setStats(res.data);
      } catch (err) {
        toast.error('Gagal memuat statistik dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-32 bg-gray-50 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Halo, {user?.nama.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 mt-2">Selamat datang di dashboard CampusRent. Berikut adalah ringkasan aktivitas Anda.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Package size={24} />
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Barang Saya</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.myItemsCount || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <ArrowRight size={24} />
            </div>
            <p className="text-gray-500 text-sm font-medium">Barang Sedang Dipinjamkan</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.myItemsBorrowed || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
              <Inbox size={24} />
            </div>
            <p className="text-gray-500 text-sm font-medium">Peminjaman Aktif Saya</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.activeBorrowingsCount || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            {stats?.actionNeededCount > 0 && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                Butuh Aksi!
              </div>
            )}
            <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center mb-4">
              <Bell size={24} />
            </div>
            <p className="text-gray-500 text-sm font-medium">Tindakan Diperlukan</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.actionNeededCount || 0}</p>
          </div>

        </div>

        {/* Quick Links & Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Pengingat Pengembalian</h2>
            {stats?.reminders && stats.reminders.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
                  <AlertTriangle className="text-red-500" size={20} />
                  <p className="text-sm font-semibold text-red-700">Ada barang yang harus segera Anda kembalikan!</p>
                </div>
                <div className="p-2">
                  {stats.reminders.map(rem => (
                    <div key={rem.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="mb-3 sm:mb-0">
                        <p className="font-semibold text-gray-900">{rem.item.namaBarang}</p>
                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                          <Clock size={14} /> Batas pengembalian: <span className="font-medium">{new Date(rem.endDate).toLocaleDateString('id-ID')}</span>
                        </p>
                      </div>
                      <Link to="/transactions" className="btn-secondary text-sm py-2 px-4 whitespace-nowrap text-center">
                        Lihat Transaksi
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Semua Aman!</h3>
                <p className="text-sm text-gray-500">Tidak ada barang yang mendekati batas waktu pengembalian saat ini.</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Akses Cepat</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
              <Link to="/items" className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition-colors group">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Search size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Cari Barang</p>
                  <p className="text-xs text-gray-500">Eksplorasi barang untuk dipinjam</p>
                </div>
              </Link>
              
              <Link to="/transactions" className="flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl transition-colors group">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Inbox size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Kelola Transaksi</p>
                  <p className="text-xs text-gray-500">Persetujuan & riwayat</p>
                </div>
              </Link>

              <Link to="/chat" className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl transition-colors group">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Pesan Masuk</p>
                  <p className="text-xs text-gray-500">Ngobrol dengan pemilik/peminjam</p>
                </div>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;

