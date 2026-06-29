import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.id.toString().includes(searchTerm) || 
                          t.borrower?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.item?.namaBarang?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Active' && t.status === 'DISEWA') return true;
    if (filterStatus === 'Pending' && (t.status === 'MENUNGGU_KONFIRMASI' || t.status === 'MENUNGGU_PEMBAYARAN')) return true;
    if (filterStatus === 'Completed' && t.status === 'SELESAI') return true;
    if (filterStatus === 'Rejected' && (t.status === 'DITOLAK' || t.status === 'DIBATALKAN')) return true;
    return false;
  });

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
          <h2 className="font-headline-lg text-headline-lg text-on-background">Log Transaksi</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Pantau seluruh aktivitas peminjaman di platform CampusRent.</p>
        </div>
        <div className="flex gap-stack-sm">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-label-md rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            Export Excel
          </button>
        </div>
      </header>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-surface-container-lowest glass-panel p-6 rounded-2xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
          </div>
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Transaksi</h3>
          <p className="font-display-lg text-[32px] font-bold text-on-surface mt-1">{stats.total}</p>
        </div>
        
        <div className="bg-surface-container-lowest glass-panel p-6 rounded-2xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">sync</span>
            </div>
          </div>
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Aktif Dipinjam</h3>
          <p className="font-display-lg text-[32px] font-bold text-on-surface mt-1">{stats.active}</p>
        </div>
        
        <div className="bg-surface-container-lowest glass-panel p-6 rounded-2xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/50 flex items-center justify-center text-on-secondary-container group-hover:bg-secondary-container transition-colors">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Selesai</h3>
          <p className="font-display-lg text-[32px] font-bold text-on-surface mt-1">{stats.completed}</p>
        </div>
        
        <div className="bg-surface-container-lowest glass-panel p-6 rounded-2xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error group-hover:bg-error group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Pending</h3>
          <p className="font-display-lg text-[32px] font-bold text-on-surface mt-1">{stats.pending}</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <section className="bg-surface-container-lowest glass-panel p-stack-md rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
          <input 
            className="w-full pl-12 pr-4 py-3 bg-surface-bright border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-on-surface" 
            placeholder="Cari ID transaksi, peminjam, atau barang..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-stack-sm overflow-x-auto pb-1 md:pb-0">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface-bright border-outline-variant rounded-xl px-4 py-3 font-label-md text-on-surface focus:border-primary focus:ring-0 min-w-[160px]"
          >
            <option value="All">Semua Status</option>
            <option value="Active">Aktif</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Selesai</option>
            <option value="Rejected">Ditolak/Batal</option>
          </select>
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
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">ID & Peminjam</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Pemilik</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Barang</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Periode</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Harga</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredTransactions.map(trx => (
                  <tr key={trx.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-primary-fixed-dim text-sm font-bold mb-1">
                        #TR-{trx.id.toString().substring(0, 8).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                          {trx.borrower?.nama ? trx.borrower.nama.charAt(0).toUpperCase() : 'B'}
                        </div>
                        <span className="text-sm font-medium text-on-surface">{trx.borrower?.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary font-bold text-[10px]">
                          {trx.item?.owner?.nama ? trx.item.owner.nama.charAt(0).toUpperCase() : 'O'}
                        </div>
                        <span className="text-sm font-medium text-on-surface">{trx.item?.owner?.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-on-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] opacity-70">inventory_2</span>
                        {trx.item?.namaBarang}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant whitespace-nowrap">
                      {new Date(trx.startDate).toLocaleDateString('id-ID', {day: '2-digit', month:'short'})} - {new Date(trx.endDate).toLocaleDateString('id-ID', {day: '2-digit', month:'short'})}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">
                      Rp {trx.totalPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        (trx.status === 'MENUNGGU_KONFIRMASI' || trx.status === 'MENUNGGU_PEMBAYARAN') ? 'bg-tertiary-container/30 text-tertiary ' :
                        trx.status === 'DISEWA' ? 'bg-primary-container/30 text-primary ' :
                        trx.status === 'SELESAI' ? 'bg-secondary-container/50 text-on-secondary-container ' :
                        (trx.status === 'DITOLAK' || trx.status === 'DIBATALKAN') ? 'bg-error/10 text-error ' :
                        'bg-surface-container-high text-on-surface-variant '
                      }`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {trx.status === 'WAITING_VERIFICATION' && trx.payment ? (
                        <button 
                          onClick={() => setSelectedPaymentTrx(trx)}
                          className="py-1.5 px-3 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          Tinjau Pembayaran
                        </button>
                      ) : (
                        <span className="text-outline text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-on-surface-variant">Data transaksi tidak ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Verification Modal */}
      {selectedPaymentTrx && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest glass-panel rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-outline-variant/20">
            <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-bright">
              <h3 className="font-headline-lg text-[20px] text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                Verifikasi Pembayaran
              </h3>
              <button 
                onClick={() => !isVerifying && setSelectedPaymentTrx(null)}
                className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-high"
                disabled={isVerifying}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                  <p className="text-xs font-medium text-on-surface-variant mb-1 uppercase tracking-wider">Total Tagihan</p>
                  <p className="font-display-lg text-[24px] font-bold text-primary">Rp {selectedPaymentTrx.totalPrice.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                  <p className="text-xs font-medium text-on-surface-variant mb-1 uppercase tracking-wider">Peminjam</p>
                  <p className="font-title-md text-on-surface">{selectedPaymentTrx.borrower?.nama}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-on-surface">Bukti Transfer:</p>
                <div className="border border-outline-variant/20 rounded-xl overflow-hidden bg-surface-container-high flex items-center justify-center min-h-[300px]">
                  {selectedPaymentTrx.payment?.buktiUrl ? (
                    <img 
                      src={`${UPLOADS_URL}${selectedPaymentTrx.payment.buktiUrl}`} 
                      alt="Bukti Transfer" 
                      className="w-full h-auto object-contain max-h-[60vh] shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src ="https://via.placeholder.com/400x500?text=Gambar+Tidak+Ditemukan";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-outline gap-2">
                      <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                      <p className="text-sm font-medium">Tidak ada bukti transfer</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-surface-bright border-t border-outline-variant/10 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedPaymentTrx(null)}
                className="px-5 py-2.5 rounded-xl font-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
                disabled={isVerifying}
              >
                Batal
              </button>
              <button 
                onClick={() => handleVerifyPayment('reject')}
                className="px-5 py-2.5 rounded-xl font-label-md text-error bg-error/10 hover:bg-error/20 transition-colors flex items-center gap-2"
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
                className="px-5 py-2.5 rounded-xl font-label-md text-on-secondary-container bg-secondary-container hover:brightness-95 transition-all shadow-sm flex items-center gap-2"
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminTransactions;
