// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Inbox, AlertTriangle, Bell, Clock, ArrowRight, CheckCircle, Search, MessageCircle,
  TrendingUp, Eye, DollarSign, Activity, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import transactionService from '../services/transaction.service';
import ownerService from '../services/owner.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [ownerStats, setOwnerStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [res, ownerStatsRes, chartRes, itemsRes] = await Promise.all([
          transactionService.getDashboardStats(),
          ownerService.getDashboardStats(),
          ownerService.getRevenueChart(),
          ownerService.getTopItems()
        ]);
        setStats(res?.data || null);
        setOwnerStats(ownerStatsRes?.data || null);
        setChartData(chartRes?.data || []);
        setTopItems(itemsRes?.data || []);
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

        {/* Owner Analytics Section */}
        <div className="mt-10 pt-10 border-t border-gray-200 dark:border-slate-700">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Analitik Barang Saya (Owner)</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">Performa barang yang Anda sewakan</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Pendapatan</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Rp {ownerStats?.totalRevenue?.toLocaleString('id-ID') || 0}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Transaksi Selesai</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{ownerStats?.totalCompletedTransactions || 0}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Barang Aktif</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{ownerStats?.activeItems || 0}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Eye size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Tayangan</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{ownerStats?.totalViews || 0}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Activity size={20} className="text-blue-500" />
                Grafik Pendapatan Bulanan
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(val) => {
                        if (val >= 1000000) return `Rp ${val / 1000000}jt`;
                        if (val >= 1000) return `Rp ${val / 1000}k`;
                        return `Rp ${val}`;
                      }}
                      tick={{fill: '#6b7280', fontSize: 12}}
                    />
                    <Tooltip 
                      cursor={{fill: '#f3f4f6'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-amber-500" />
                Barang Terpopuler
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2">
                {topItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <AlertCircle size={40} className="text-gray-300 dark:text-slate-600 mb-3" />
                    <p className="text-gray-500 dark:text-slate-400 text-sm">Belum ada data analitik untuk barang Anda.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate" title={item.namaBarang}>
                            {item.namaBarang}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle size={10} />
                              {item.totalTransactions} disewa
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                              <Eye size={10} />
                              {item.viewCount} views
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            Rp {item.hargaSewa.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

