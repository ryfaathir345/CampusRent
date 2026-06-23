// src/pages/Wallet.jsx
import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import * as walletService from '../services/wallet.service';
import toast from 'react-hot-toast';

const Wallet = () => {
  const [walletInfo, setWalletInfo] = useState({ saldo: 0, withdrawals: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawModal, setWithdrawModal] = useState({ isOpen: false, amount: '', bankName: '', accountNumber: '', accountName: '' });

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
            
            <button 
              onClick={() => setWithdrawModal({ ...withdrawModal, isOpen: true })}
              className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <ArrowUpRight size={18} /> Tarik Dana
            </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Riwayat Penarikan</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : walletInfo.withdrawals.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Belum ada riwayat penarikan dana.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {walletInfo.withdrawals.map((w) => (
                <div key={w.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${w.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>
                      {w.status === 'REJECTED' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Penarikan ke {w.bankName}</p>
                      <p className="text-sm text-gray-500">{new Date(w.createdAt).toLocaleDateString('id-ID')} • {w.accountNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 mb-1">Rp {w.amount.toLocaleString('id-ID')}</p>
                    <div className="flex items-center justify-end gap-1 text-xs font-medium">
                      {getStatusIcon(w.status)}
                      <span className={w.status === 'PENDING' ? 'text-yellow-600' : w.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}>
                        {getStatusText(w.status)}
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
    </div>
  );
};

export default Wallet;
