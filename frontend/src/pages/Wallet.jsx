// src/pages/Wallet.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, Upload, Plus } from 'lucide-react';
import * as walletService from '../services/wallet.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const Wallet = () => {
  const [walletInfo, setWalletInfo] = useState({ saldo: 0, withdrawals: [], topUps: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawModal, setWithdrawModal] = useState({ isOpen: false, amount: '', bankName: '', accountNumber: '', accountName: '' });
  const [topUpModal, setTopUpModal] = useState({ isOpen: false, amount: '', bukti: null });
  const [imageModal, setImageModal] = useState({ isOpen: false, url: '' });

  const fetchWallet = async () => {
    setIsLoading(true);
    try {
      const res = await walletService.getWalletInfo();
      setWalletInfo(res.data);
    } catch (err) {
      toast.error('Gagal memuat info dompet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (walletInfo.saldo < withdrawModal.amount) {
      return toast.error('Saldo tidak mencukupi');
    }
    
    try {
      toast.loading('Memproses permintaan...', { id: 'withdraw' });
      await walletService.requestWithdrawal({
        amount: parseInt(withdrawModal.amount),
        bankName: withdrawModal.bankName,
        accountNumber: withdrawModal.accountNumber,
        accountName: withdrawModal.accountName
      });
      toast.success('Permintaan penarikan berhasil dikirim', { id: 'withdraw' });
      setWithdrawModal({ isOpen: false, amount: '', bankName: '', accountNumber: '', accountName: '' });
      fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim permintaan', { id: 'withdraw' });
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!topUpModal.amount || topUpModal.amount < 10000) {
      return toast.error('Minimal top up adalah Rp 10.000');
    }
    if (!topUpModal.bukti) {
      return toast.error('Bukti transfer wajib diunggah');
    }

    try {
      toast.loading('Mengunggah bukti...', { id: 'topup' });
      const formData = new FormData();
      formData.append('amount', topUpModal.amount);
      formData.append('bukti', topUpModal.bukti);

      await walletService.requestTopUp(formData);
      toast.success('Permintaan Top Up berhasil dikirim', { id: 'topup' });
      setTopUpModal({ isOpen: false, amount: '', bukti: null });
      fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim permintaan top up', { id: 'topup' });
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'PENDING') return <Clock size={16} className="text-yellow-500" />;
    if (status === 'APPROVED') return <CheckCircle size={16} className="text-green-500" />;
    if (status === 'REJECTED') return <XCircle size={16} className="text-red-500" />;
  };

  const getStatusText = (status) => {
    if (status === 'PENDING') return 'Diproses';
    if (status === 'APPROVED') return 'Berhasil';
    if (status === 'REJECTED') return 'Ditolak';
  };

  const allTransactions = [
    ...(walletInfo.withdrawals || []).map(w => ({ ...w, type: 'WITHDRAWAL' })),
    ...(walletInfo.topUps || []).map(t => ({ ...t, type: 'TOPUP' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dompet Saya</h1>
        
        {/* Saldo Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-100 mb-2">
              <WalletIcon size={20} />
              <span className="font-medium">Total Saldo Aktif</span>
            </div>
            <h2 className="text-5xl font-extrabold mb-6">
              Rp {isLoading ? '...' : walletInfo.saldo.toLocaleString('id-ID')}
            </h2>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setTopUpModal({ ...topUpModal, isOpen: true })}
                className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={18} /> Top Up Saldo
              </button>
              <button 
                onClick={() => setWithdrawModal({ ...withdrawModal, isOpen: true })}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm border border-white/20"
              >
                <ArrowUpRight size={18} /> Tarik Dana
              </button>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Riwayat Transaksi</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : allTransactions.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Belum ada riwayat transaksi dompet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {allTransactions.map((tx) => (
                <div key={`${tx.type}-${tx.id}`} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.status === 'REJECTED' 
                        ? 'bg-red-50 text-red-600' 
                        : tx.type === 'TOPUP' 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-gray-50 text-gray-600'
                    }`}>
                      {tx.status === 'REJECTED' ? <XCircle size={20} /> : tx.type === 'TOPUP' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {tx.type === 'TOPUP' ? 'Top Up Saldo' : `Penarikan ke ${tx.bankName}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString('id-ID')} 
                        {tx.type === 'WITHDRAWAL' && ` • ${tx.accountNumber}`}
                        {tx.type === 'TOPUP' && tx.buktiUrl && (
                          <span> • <button onClick={() => setImageModal({ isOpen: true, url: `${UPLOADS_URL}${tx.buktiUrl}` })} className="text-blue-500 hover:underline">Lihat Bukti</button></span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold mb-1 ${tx.type === 'TOPUP' && tx.status === 'APPROVED' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'TOPUP' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center justify-end gap-1 text-xs font-medium">
                      {getStatusIcon(tx.status)}
                      <span className={tx.status === 'PENDING' ? 'text-yellow-600' : tx.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}>
                        {getStatusText(tx.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {withdrawModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Tarik Dana</h3>
            <form onSubmit={handleWithdraw}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    min="10000"
                    max={walletInfo.saldo}
                    required
                    value={withdrawModal.amount}
                    onChange={(e) => setWithdrawModal({ ...withdrawModal, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Contoh: 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank / E-Wallet</label>
                  <input
                    type="text"
                    required
                    value={withdrawModal.bankName}
                    onChange={(e) => setWithdrawModal({ ...withdrawModal, bankName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Contoh: BCA / GoPay / DANA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening / HP</label>
                  <input
                    type="text"
                    required
                    value={withdrawModal.accountNumber}
                    onChange={(e) => setWithdrawModal({ ...withdrawModal, accountNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Contoh: 08123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Atas Nama</label>
                  <input
                    type="text"
                    required
                    value={withdrawModal.accountName}
                    onChange={(e) => setWithdrawModal({ ...withdrawModal, accountName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Sesuai buku rekening"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setWithdrawModal({ isOpen: false, amount: '', bankName: '', accountNumber: '', accountName: '' })}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Konfirmasi Penarikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Top Up Modal */}
      {topUpModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Top Up Saldo</h3>
            <p className="text-sm text-gray-500 mb-6">Silakan transfer untuk mengisi ulang saldo Anda.</p>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
              <p className="text-sm text-blue-800 font-medium mb-1">Transfer ke Rekening Bersama:</p>
              <p className="text-lg font-bold text-blue-900 tracking-wider">BCA - 6005050450</p>
              <p className="text-sm text-blue-700">a.n Admin CampusRent</p>
            </div>
            <form onSubmit={handleTopUp}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Top Up (Rp)</label>
                  <input
                    type="number"
                    min="10000"
                    required
                    value={topUpModal.amount}
                    onChange={(e) => setTopUpModal({ ...topUpModal, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Minimal Rp 10.000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Transfer (Image)</label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setTopUpModal({ ...topUpModal, bukti: e.target.files[0] })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Upload size={24} className="mb-2" />
                      {topUpModal.bukti ? (
                        <span className="text-blue-600 font-medium text-center">{topUpModal.bukti.name}</span>
                      ) : (
                        <span className="text-sm">Klik atau seret gambar ke sini</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTopUpModal({ isOpen: false, amount: '', bukti: null })}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image View Modal */}
      {imageModal.isOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
          onClick={() => setImageModal({ isOpen: false, url: '' })}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 shrink-0">
              <h3 className="font-bold text-gray-900 text-lg">Bukti Transfer</h3>
              <button 
                onClick={() => setImageModal({ isOpen: false, url: '' })} 
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px] block">close</span>
              </button>
            </div>
            <div className="p-4 flex-1 min-h-0 flex items-center justify-center bg-gray-50 overflow-auto">
              <img src={imageModal.url} alt="Bukti Transfer" className="max-w-full h-auto rounded-lg object-contain" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Wallet;
