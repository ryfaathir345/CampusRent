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
    <div className="animate-fade-in max-w-[1400px] mx-auto">
      {/* Header Actions Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            Transactions History
          </h2>
          <p className="text-on-surface-variant font-body-md mt-1">Manage and monitor student item rental activity across all campuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 rounded-full bg-primary text-white font-label-md text-label-md hover:bg-primary/90 shadow-sm transition-all active:scale-95 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export Excel
          </button>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-8">
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
          </div>
          <h3 className="text-on-surface-variant font-label-md text-label-md">Total Transactions</h3>
          <p className="font-display-lg text-display-lg text-on-surface mt-1">{stats.total}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">sync</span>
            </div>
          </div>
          <h3 className="text-on-surface-variant font-label-md text-label-md">Active Rentals</h3>
          <p className="font-display-lg text-display-lg text-on-surface mt-1">{stats.active}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-tertiary-container/10 flex items-center justify-center text-tertiary-container group-hover:bg-tertiary-container group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
          <h3 className="text-on-surface-variant font-label-md text-label-md">Completed</h3>
          <p className="font-display-lg text-display-lg text-on-surface mt-1">{stats.completed}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center text-error group-hover:bg-error group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <h3 className="text-on-surface-variant font-label-md text-label-md">Pending</h3>
          <p className="font-display-lg text-display-lg text-on-surface mt-1">{stats.pending}</p>
        </div>
      </div>

      {/* History Table Card */}
      <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="px-gutter py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
          <h4 className="font-headline-sm text-headline-sm text-on-surface">Recent Rental History</h4>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-outline-variant rounded-lg text-label-sm font-label-sm py-1.5 px-3 focus:ring-primary focus:border-primary outline-none"
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
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-gutter py-4 font-bold text-label-sm text-on-surface-variant uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase tracking-wider">Borrower</th>
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase tracking-wider">Rental Period</th>
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase tracking-wider">Total Price</th>
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-gutter py-8 text-center text-on-surface-variant">No transactions found.</td>
                </tr>
              ) : filteredTransactions.map(trx => (
                <tr key={trx.id} className="hover:bg-surface-container transition-colors group">
                  <td className="px-gutter py-5 font-mono text-label-sm text-on-surface-variant font-medium">
                    #TR-{trx.id.toString().substring(0, 6)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                        {trx.borrower?.nama ? trx.borrower.nama.charAt(0).toUpperCase() : 'B'}
                      </div>
                      <span className="text-on-surface font-medium">{trx.borrower?.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-[10px]">
                        {trx.item?.owner?.nama ? trx.item.owner.nama.charAt(0).toUpperCase() : 'O'}
                      </div>
                      <span className="text-on-surface">{trx.item?.owner?.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                      {trx.item?.namaBarang}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant text-sm">
                    {new Date(trx.startDate).toLocaleDateString('id-ID')} - {new Date(trx.endDate).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-5 font-bold text-on-surface">
                    Rp {trx.totalPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(trx.status)}`}>
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {trx.status === 'WAITING_VERIFICATION' && trx.payment ? (
                      <button 
                        onClick={() => setSelectedPaymentTrx(trx)}
                        className="btn-primary py-1.5 px-3 text-xs"
                      >
                        Tinjau Pembayaran
                      </button>
                    ) : (
                      <span className="text-on-surface-variant text-xs">-</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">verified</span>
                Verifikasi Pembayaran
              </h3>
              <button 
                onClick={() => !isVerifying && setSelectedPaymentTrx(null)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                disabled={isVerifying}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant">
                  <p className="text-label-sm text-on-surface-variant mb-1">Total Tagihan</p>
                  <p className="font-bold text-lg text-on-surface">Rp {selectedPaymentTrx.totalPrice.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant">
                  <p className="text-label-sm text-on-surface-variant mb-1">Peminjam</p>
                  <p className="font-medium text-on-surface">{selectedPaymentTrx.borrower?.nama}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-label-md text-on-surface">Bukti Transfer:</p>
                <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center min-h-[300px]">
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
                    <p className="text-on-surface-variant">Tidak ada bukti transfer dilampirkan</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex justify-end gap-3">
              <button 
                onClick={() => setSelectedPaymentTrx(null)}
                className="px-5 py-2 rounded-lg font-medium text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
                disabled={isVerifying}
              >
                Batal
              </button>
              <button 
                onClick={() => handleVerifyPayment('reject')}
                className="px-5 py-2 rounded-lg font-medium text-error bg-error/10 hover:bg-error/20 transition-colors flex items-center gap-2"
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
                className="px-5 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2"
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
