import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedPaymentTrx, setSelectedPaymentTrx] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0
  });

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getTransactions();
      const txs = res.data;
      setTransactions(txs);
      
      setStats({
        total: txs.length,
        active: txs.filter(t => t.status === 'DISEWA').length,
        completed: txs.filter(t => t.status === 'SELESAI').length,
        pending: txs.filter(t => t.status === 'MENUNGGU_KONFIRMASI' || t.status === 'MENUNGGU_PEMBAYARAN').length
      });
    } catch (err) {
      toast.error('Gagal memuat data transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleVerifyPayment = async (action) => {
    if (!selectedPaymentTrx?.payment?.id) return;
    setIsVerifying(true);
    try {
      await adminService.verifyPayment(selectedPaymentTrx.payment.id, action);
      toast.success(action === 'approve' ? 'Pembayaran disetujui' : 'Pembayaran ditolak');
      setSelectedPaymentTrx(null);
      fetchTransactions(); // Refresh data
    } catch (error) {
      toast.error('Gagal memverifikasi pembayaran');
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'MENUNGGU_KONFIRMASI':
      case 'MENUNGGU_PEMBAYARAN':
        return 'bg-yellow-100 text-yellow-700';
      case 'DISEWA':
        return 'bg-blue-100 text-blue-700';
      case 'SELESAI':
        return 'bg-green-100 text-green-700';
      case 'DITOLAK':
      case 'DIBATALKAN':
        return 'bg-red-100 text-red-700';
      case 'TERLAMBAT':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Active' && t.status === 'DISEWA') return true;
    if (filterStatus === 'Pending' && (t.status === 'MENUNGGU_KONFIRMASI' || t.status === 'MENUNGGU_PEMBAYARAN')) return true;
    if (filterStatus === 'Completed' && t.status === 'SELESAI') return true;
    if (filterStatus === 'Rejected' && (t.status === 'DITOLAK' || t.status === 'DIBATALKAN')) return true;
    return false;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto space-y-6">
      {/* Header Actions Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="font-bold text-gray-800 text-title-md dark:text-white/90 flex items-center gap-2">
            Transactions History
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and monitor student item rental activity across all campuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 rounded-full bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 shadow-theme-md transition-all active:scale-95 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export Excel
          </button>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm hover:shadow-theme-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center text-brand-500 dark:text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</h3>
          <p className="font-bold text-title-xl text-gray-800 dark:text-white/90 mt-1">{stats.total}</p>
        </div>
        
        <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm hover:shadow-theme-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary-50 dark:bg-secondary-500/20 flex items-center justify-center text-secondary-500 dark:text-secondary-400 group-hover:bg-secondary-500 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">sync</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Rentals</h3>
          <p className="font-bold text-title-xl text-gray-800 dark:text-white/90 mt-1">{stats.active}</p>
        </div>
        
        <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm hover:shadow-theme-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-success-50 dark:bg-success-500/20 flex items-center justify-center text-success-500 dark:text-success-400 group-hover:bg-success-500 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</h3>
          <p className="font-bold text-title-xl text-gray-800 dark:text-white/90 mt-1">{stats.completed}</p>
        </div>
        
        <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm hover:shadow-theme-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-warning-50 dark:bg-warning-500/20 flex items-center justify-center text-warning-500 dark:text-warning-400 group-hover:bg-warning-500 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</h3>
          <p className="font-bold text-title-xl text-gray-800 dark:text-white/90 mt-1">{stats.pending}</p>
        </div>
      </div>

      {/* History Table Card */}
      <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <h4 className="font-bold text-title-sm text-gray-800 dark:text-white/90">Recent Rental History</h4>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 font-medium py-1.5 px-3 focus:ring-brand-500 focus:border-brand-500 outline-none"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected/Cancelled</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Borrower</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rental Period</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Price</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No transactions found.</td>
                </tr>
              ) : filteredTransactions.map(trx => (
                <tr key={trx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-5 font-mono text-sm text-gray-500 dark:text-gray-400 font-medium">
                    #TR-{trx.id.toString().substring(0, 6)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs">
                        {trx.borrower?.nama ? trx.borrower.nama.charAt(0).toUpperCase() : 'B'}
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">{trx.borrower?.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-50 dark:bg-secondary-500/20 flex items-center justify-center text-secondary-600 dark:text-secondary-400 font-bold text-xs">
                        {trx.item?.owner?.nama ? trx.item.owner.nama.charAt(0).toUpperCase() : 'O'}
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">{trx.item?.owner?.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                      {trx.item?.namaBarang}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(trx.startDate).toLocaleDateString('id-ID')} - {new Date(trx.endDate).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-gray-800 dark:text-white/90">
                    Rp {trx.totalPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (trx.status === 'MENUNGGU_KONFIRMASI' || trx.status === 'MENUNGGU_PEMBAYARAN') ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500' :
                      trx.status === 'DISEWA' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-500' :
                      trx.status === 'SELESAI' ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500' :
                      (trx.status === 'DITOLAK' || trx.status === 'DIBATALKAN') ? 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-500' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {trx.status === 'WAITING_VERIFICATION' && trx.payment ? (
                      <button 
                        onClick={() => setSelectedPaymentTrx(trx)}
                        className="py-1.5 px-3 text-xs font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                      >
                        Tinjau Pembayaran
                      </button>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Verification Modal */}
      {selectedPaymentTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-title-sm text-gray-800 dark:text-white/90 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-500">verified</span>
                Verifikasi Pembayaran
              </h3>
              <button 
                onClick={() => !isVerifying && setSelectedPaymentTrx(null)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                disabled={isVerifying}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Tagihan</p>
                  <p className="font-bold text-lg text-gray-800 dark:text-white/90">Rp {selectedPaymentTrx.totalPrice.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Peminjam</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">{selectedPaymentTrx.borrower?.nama}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">Bukti Transfer:</p>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950 flex items-center justify-center min-h-[300px]">
                  {selectedPaymentTrx.payment?.buktiUrl ? (
                    <img 
                      src={`${UPLOADS_URL}${selectedPaymentTrx.payment.buktiUrl}`} 
                      alt="Bukti Transfer" 
                      className="w-full h-auto object-contain max-h-[60vh]"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "https://via.placeholder.com/400x500?text=Gambar+Tidak+Ditemukan";
                      }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada bukti transfer dilampirkan</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedPaymentTrx(null)}
                className="px-5 py-2 rounded-lg font-medium text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                disabled={isVerifying}
              >
                Batal
              </button>
              <button 
                onClick={() => handleVerifyPayment('reject')}
                className="px-5 py-2 rounded-lg font-medium text-sm text-error-600 bg-error-50 hover:bg-error-100 dark:text-error-500 dark:bg-error-500/10 dark:hover:bg-error-500/20 transition-colors flex items-center gap-2"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                )}
                Tolak
              </button>
              <button 
                onClick={() => handleVerifyPayment('approve')}
                className="px-5 py-2 rounded-lg font-medium text-sm text-success-600 bg-success-50 hover:bg-success-100 dark:text-success-500 dark:bg-success-500/10 dark:hover:bg-success-500/20 transition-colors flex items-center gap-2"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                )}
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
