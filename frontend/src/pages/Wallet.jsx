import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import * as walletService from '../services/wallet.service';
import toast from 'react-hot-toast';
import Sidebar from '../components/common/Sidebar';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const Wallet = () => {
 const [walletInfo, setWalletInfo] = useState({ saldo: 0, withdrawals: [], topUps: [] });
 const [isLoading, setIsLoading] = useState(true);
 const [withdrawModal, setWithdrawModal] = useState({ isOpen: false, amount: '', bankName: 'BCA', accountNumber: '', accountName: '' });
 const [topUpModal, setTopUpModal] = useState({ isOpen: false, amount: '', bukti: null });
 const [imageModal, setImageModal] = useState({ isOpen: false, url: '' });

 const fetchWallet = useCallback(async () => {
  setIsLoading(true);
  try {
   const res = await walletService.getWalletInfo();
   setWalletInfo(res.data);
  } catch (error) {
   console.error(error);
   toast.error('Gagal memuat info dompet');
  } finally {
   setIsLoading(false);
  }
 }, []);

 useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchWallet();
 }, [fetchWallet]);

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
   setWithdrawModal({ isOpen: false, amount: '', bankName: 'BCA', accountNumber: '', accountName: '' });
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

 const getStatusText = (status) => {
  if (status === 'PENDING') return 'Diproses';
  if (status === 'APPROVED') return 'Berhasil';
  if (status === 'REJECTED') return 'Ditolak';
  return status;
 };

 const getStatusStyle = (status) => {
  if (status === 'PENDING') return 'bg-tertiary-container/30 text-tertiary';
  if (status === 'APPROVED') return 'bg-secondary-container/50 text-on-secondary-container';
  if (status === 'REJECTED') return 'bg-error/10 text-error';
  return 'bg-surface-variant text-on-surface-variant';
 };

 const allTransactions = [
  ...(walletInfo.withdrawals || []).map(w => ({ ...w, type: 'WITHDRAWAL' })),
  ...(walletInfo.topUps || []).map(t => ({ ...t, type: 'TOPUP' }))
 ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

 const totalPengeluaran = allTransactions.filter(t => t.type === 'WITHDRAWAL' && t.status !== 'REJECTED').reduce((acc, curr) => acc + curr.amount, 0);
 const totalPemasukan = allTransactions.filter(t => t.type === 'TOPUP' && t.status !== 'REJECTED').reduce((acc, curr) => acc + curr.amount, 0);

 return (
  <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col relative overflow-x-hidden dot-pattern">
   
   {/* Ambient Background Effect */}
   <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"></div>
    <div className="absolute top-1/3 -left-20 w-72 h-72 bg-secondary-container/20 rounded-full mix-blend-multiply filter blur-[60px] opacity-50"></div>
   </div>

   <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-gutter py-stack-lg flex flex-col md:flex-row gap-gutter">
    
    <Sidebar activeTab="wallet" />
    
    {/* Canvas Area */}
    <div className="flex-1 flex flex-col gap-stack-lg min-w-0">
     {/* Page Header */}
     <div>
      <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Dompet Anda</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-2">Kelola saldo untuk menyewa barang atau tarik pendapatan dari barang yang Anda sewakan.</p>
     </div>

     {/* Bento Grid Layout for Wallet Main Content */}
     <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      {/* Saldo Card */}
      <div className="lg:col-span-12 xl:col-span-7 flex flex-col">
       <div 
        className="rounded-xl p-8 shadow-xl text-white relative overflow-hidden h-full flex flex-col justify-between"
        style={{ background: 'linear-gradient(135deg, #004ac6 0%, #00174b 100%)' }}
       >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="relative z-10">
         <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-white/80 bg-white/10 p-2 rounded-lg" style={{fontVariationSettings: "'FILL' 1"}}>account_balance_wallet</span>
          <h3 className="font-label-md text-label-md text-white/90 font-medium">Total Saldo Aktif</h3>
         </div>
         <div className="font-display-lg text-display-lg font-black tracking-tight my-4 text-white">
          Rp {walletInfo.saldo.toLocaleString('id-ID')}
         </div>
         <p className="font-label-sm text-label-sm text-white/70">Terakhir diperbarui hari ini</p>
        </div>
        <div className="relative z-10 flex gap-4 mt-8">
         <button 
          onClick={() => setTopUpModal({ isOpen: true, amount: '', bukti: null })}
          className="flex-1 bg-[#ffffff] text-[#004ac6] font-title-md text-title-md py-3 px-4 rounded-lg shadow-sm hover:bg-white/90 transition-colors flex justify-center items-center gap-2"
         >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Top Up Saldo
         </button>
         <button 
          onClick={() => setWithdrawModal({ isOpen: true, amount: '', bankName: 'BCA', accountNumber: '', accountName: '' })}
          className="flex-1 border border-white/40 text-white font-title-md text-title-md py-3 px-4 rounded-lg hover:bg-white/10 transition-colors flex justify-center items-center gap-2"
         >
          <span className="material-symbols-outlined text-[20px]">payments</span>
          Tarik Dana
         </button>
        </div>
       </div>
      </div>

      {/* Quick Stats / Info Widget */}
      <div className="lg:col-span-12 xl:col-span-5 grid grid-cols-2 gap-stack-md">
       <div className="glass-panel p-stack-md rounded-xl flex flex-col justify-center items-start shadow-sm hover:-translate-y-1 transition-transform duration-300">
        <span className="material-symbols-outlined text-tertiary-container bg-tertiary-container/10 p-3 rounded-full mb-3">arrow_downward</span>
        <p className="font-label-sm text-label-sm text-on-surface-variant">Total Pengeluaran</p>
        <p className="font-title-md text-title-md text-on-surface font-bold">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
       </div>
       <div className="glass-panel p-stack-md rounded-xl flex flex-col justify-center items-start shadow-sm hover:-translate-y-1 transition-transform duration-300">
        <span className="material-symbols-outlined text-secondary bg-secondary-container/30 p-3 rounded-full mb-3">arrow_upward</span>
        <p className="font-label-sm text-label-sm text-on-surface-variant">Total Pemasukan</p>
        <p className="font-title-md text-title-md text-on-surface font-bold">Rp {totalPemasukan.toLocaleString('id-ID')}</p>
       </div>
       <div className="col-span-2 glass-panel p-stack-md rounded-xl flex items-center justify-between shadow-sm bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3">
         <span className="material-symbols-outlined text-primary text-[28px]">security</span>
         <div>
          <h4 className="font-title-md text-[16px] text-on-surface font-semibold">Dana Aman</h4>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Dilindungi oleh CampusRent Escrow</p>
         </div>
        </div>
       </div>
      </div>
     </div>

     {/* Transaction History Section */}
     <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
       <h2 className="font-title-md text-title-md text-on-surface font-bold">Riwayat Transaksi</h2>
      </div>
      <div className="glass-panel rounded-xl shadow-sm overflow-hidden border border-outline-variant/30">
       <div className="divide-y divide-outline-variant/20">
        {isLoading ? (
         <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
         </div>
        ) : allTransactions.length === 0 ? (
         <div className="text-center p-8 text-on-surface-variant font-body-md">
          Belum ada riwayat transaksi.
         </div>
        ) : (
         allTransactions.map(t => (
          <div key={`${t.type}-${t.id}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container/50 transition-colors group">
           <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${t.type === 'TOPUP' ? 'bg-secondary-container/30 text-secondary' : 'bg-error-container/50 text-on-error-container'}`}>
             <span className="material-symbols-outlined">
              {t.type === 'TOPUP' ? 'south_west' : 'north_east'}
             </span>
            </div>
            <div>
             <h4 className="font-label-md text-[16px] font-semibold text-on-surface">
              {t.type === 'TOPUP' ? 'Top Up Saldo' : 'Penarikan Dana'}
             </h4>
             <p className="font-label-sm text-label-sm text-on-surface-variant">
              {new Date(t.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
             </p>
             {t.type === 'WITHDRAWAL' && (
              <p className="text-[12px] text-on-surface-variant mt-0.5">
               {t.bankName} - {t.accountNumber} ({t.accountName})
              </p>
             )}
            </div>
           </div>
           <div className="flex items-center sm:block text-right shrink-0 gap-3 justify-between sm:justify-end">
            <p className={`font-label-md text-[16px] font-bold ${t.type === 'TOPUP' ? 'text-secondary' : 'text-on-surface'}`}>
             {t.type === 'TOPUP' ? '+' : '-'}Rp {t.amount.toLocaleString('id-ID')}
            </p>
            <div className="flex items-center justify-end gap-2 mt-1">
             <span className={`inline-block px-2 py-0.5 rounded-full font-label-sm text-[10px] uppercase font-bold tracking-wider ${getStatusStyle(t.status)}`}>
              {getStatusText(t.status)}
             </span>
             {t.type === 'TOPUP' && t.buktiUrl && (
              <button 
               onClick={() => setImageModal({ isOpen: true, url: t.buktiUrl })}
               className="text-primary hover:bg-primary/10 p-1 rounded transition-colors flex items-center"
               title="Lihat Bukti"
              >
               <span className="material-symbols-outlined text-[16px]">image</span>
              </button>
             )}
            </div>
           </div>
          </div>
         ))
        )}
       </div>
      </div>
     </div>
    </div>
   </main>

   {/* Top Up Modal */}
   {topUpModal.isOpen && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
     <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setTopUpModal({ isOpen: false, amount: '', bukti: null })}></div>
     <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col border border-outline-variant/30 transform transition-all">
      <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
       <h3 className="font-title-md text-title-md text-on-surface font-bold">Top Up Saldo</h3>
       <button onClick={() => setTopUpModal({ isOpen: false, amount: '', bukti: null })} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-variant transition-colors">
        <span className="material-symbols-outlined">close</span>
       </button>
      </div>
      <form onSubmit={handleTopUp} className="flex flex-col">
       <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
        <div>
         <label className="font-label-md text-label-md text-on-surface mb-2 block font-semibold">Nominal Top Up</label>
         <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-title-md text-on-surface-variant">Rp</span>
          <input 
           type="number" 
           min="10000" 
           step="10000" 
           value={topUpModal.amount} 
           onChange={(e) => setTopUpModal({ ...topUpModal, amount: e.target.value })} 
           className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 font-body-lg text-body-lg text-on-surface transition-all" 
           placeholder="0" 
           required
          />
         </div>
         <p className="font-label-sm text-[12px] text-on-surface-variant mt-2">Minimal top up Rp 10.000</p>
        </div>
        
        {/* Preset Amounts */}
        <div className="grid grid-cols-3 gap-2">
         {[50000, 100000, 200000].map(amt => (
          <button 
           key={amt} 
           type="button" 
           onClick={() => setTopUpModal({ ...topUpModal, amount: amt.toString() })}
           className={`py-2 px-1 border rounded-lg font-label-md text-label-md transition-colors ${topUpModal.amount === amt.toString() ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/50 text-on-surface hover:border-primary hover:bg-primary/5 hover:text-primary'}`}
          >
           {amt.toLocaleString('id-ID')}
          </button>
         ))}
        </div>

        <div className="bg-surface-container-highest/50 p-4 rounded-xl border border-primary/20">
         <p className="font-label-md text-[14px] text-on-surface font-semibold mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">info</span>
          Instruksi Transfer
         </p>
         <p className="font-body-md text-[14px] text-on-surface-variant mb-3">Silakan transfer sesuai nominal ke rekening berikut:</p>
         <div className="bg-surface rounded-lg p-3 border border-outline-variant/30 flex justify-between items-center">
          <div>
           <p className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wide">Bank BCA</p>
           <p className="font-title-md text-[18px] text-on-surface font-bold font-mono tracking-wider mt-1">6005050450</p>
           <p className="font-label-sm text-[12px] text-on-surface-variant mt-1">a.n Admin CampusRent</p>
          </div>
          <button type="button" onClick={() => { navigator.clipboard.writeText('6005050450'); toast.success('Nomor rekening disalin'); }} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors flex flex-col items-center gap-1">
           <span className="material-symbols-outlined text-[20px]">content_copy</span>
           <span className="text-[10px] font-semibold">Salin</span>
          </button>
         </div>
        </div>

        <div>
         <label className="font-label-md text-label-md text-on-surface mb-2 block font-semibold">Bukti Transfer</label>
         <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setTopUpModal({ ...topUpModal, bukti: e.target.files[0] })} 
          className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" 
          required 
         />
        </div>
       </div>
       <div className="p-6 border-t border-outline-variant/20 bg-surface">
        <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-on-primary font-title-md text-[16px] py-3 rounded-lg shadow-md transition-colors font-semibold">Konfirmasi Top Up</button>
       </div>
      </form>
     </div>
    </div>,
    document.body
   )}

   {/* Withdraw Modal */}
   {withdrawModal.isOpen && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
     <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setWithdrawModal({ isOpen: false, amount: '', bankName: 'BCA', accountNumber: '', accountName: '' })}></div>
     <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col border border-outline-variant/30 transform transition-all">
      <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
       <h3 className="font-title-md text-title-md text-on-surface font-bold">Tarik Dana</h3>
       <button onClick={() => setWithdrawModal({ isOpen: false, amount: '', bankName: 'BCA', accountNumber: '', accountName: '' })} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-variant transition-colors">
        <span className="material-symbols-outlined">close</span>
       </button>
      </div>
      <form onSubmit={handleWithdraw} className="flex flex-col">
       <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20">
         <span className="font-label-md text-label-md text-on-surface font-medium">Saldo Tersedia</span>
         <span className="font-title-md text-[18px] text-primary font-bold">Rp {walletInfo.saldo.toLocaleString('id-ID')}</span>
        </div>
        
        <div>
         <label className="font-label-md text-label-md text-on-surface mb-2 block font-semibold">Nominal Penarikan</label>
         <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-title-md text-on-surface-variant">Rp</span>
          <input 
           type="number" 
           max={walletInfo.saldo}
           value={withdrawModal.amount} 
           onChange={(e) => setWithdrawModal({ ...withdrawModal, amount: e.target.value })} 
           className="w-full pl-12 pr-20 py-3 bg-surface-container rounded-lg border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 font-body-lg text-body-lg text-on-surface transition-all" 
           placeholder="0" 
           required
          />
          <button type="button" onClick={() => setWithdrawModal({ ...withdrawModal, amount: walletInfo.saldo.toString() })} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary font-label-md text-label-md font-bold hover:underline">Semua</button>
         </div>
        </div>

        <div>
         <label className="font-label-md text-label-md text-on-surface mb-2 block font-semibold">Tujuan Penarikan</label>
         <select 
          value={withdrawModal.bankName} 
          onChange={(e) => setWithdrawModal({ ...withdrawModal, bankName: e.target.value })} 
          className="w-full p-3 bg-surface-container rounded-lg border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 font-body-md text-body-md text-on-surface appearance-none mb-4"
         >
          <option value="BCA">Bank BCA</option>
          <option value="Mandiri">Bank Mandiri</option>
          <option value="BNI">Bank BNI</option>
          <option value="BRI">Bank BRI</option>
         </select>
         <input 
          type="text" 
          value={withdrawModal.accountNumber} 
          onChange={(e) => setWithdrawModal({ ...withdrawModal, accountNumber: e.target.value })} 
          className="w-full px-4 py-3 bg-surface-container rounded-lg border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 font-body-md text-on-surface mb-4" 
          placeholder="Nomor Rekening" 
          required 
         />
         <input 
          type="text" 
          value={withdrawModal.accountName} 
          onChange={(e) => setWithdrawModal({ ...withdrawModal, accountName: e.target.value })} 
          className="w-full px-4 py-3 bg-surface-container rounded-lg border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 font-body-md text-on-surface" 
          placeholder="Nama Pemilik Rekening" 
          required 
         />
        </div>
       </div>
       <div className="p-6 border-t border-outline-variant/20 bg-surface">
        <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-on-primary font-title-md text-[16px] py-3 rounded-lg shadow-md transition-colors font-semibold">Tarik Sekarang</button>
       </div>
      </form>
     </div>
    </div>,
    document.body
   )}

   {/* Image Modal for Top Up Proof */}
   {imageModal.isOpen && createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
     <div className="absolute inset-0 bg-on-surface/80 backdrop-blur-sm" onClick={() => setImageModal({ isOpen: false, url: '' })}></div>
     <div className="relative z-10 max-w-3xl w-full">
      <button onClick={() => setImageModal({ isOpen: false, url: '' })} className="absolute -top-12 right-0 text-white hover:text-primary transition-colors">
       <span className="material-symbols-outlined text-[32px]">close</span>
      </button>
      <img src={`${UPLOADS_URL}${imageModal.url}`} alt="Bukti Transfer" className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl" />
     </div>
    </div>,
    document.body
   )}
  </div>
 );
};

export default Wallet;
