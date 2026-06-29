import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import itemService from '../services/item.service';
import transactionService from '../services/transaction.service';
import reviewService from '../services/review.service';
import wishlistService from '../services/wishlist.service';
import reportService from '../services/report.service';
import promoService from '../services/promo.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const CATEGORY_ICONS = {
 'elektronik': 'devices',
 'buku': 'menu_book',
 'alat_lab': 'science',
 'gaming': 'sports_esports',
 'pakaian': 'checkroom',
 'kendaraan': 'directions_car',
 'olahraga': 'sports_basketball',
 'musik': 'piano',
 'outdoor': 'camping'
};

const getCategoryIcon = (name) => {
 const normalized = name?.toLowerCase() || '';
 for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
 if (normalized.includes(key)) return icon;
 }
 return 'category';
};

const ItemDetail = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const { user, isAuthenticated } = useAuth();
 
 const [item, setItem] = useState(null);
 const [ownerReviews, setOwnerReviews] = useState({ avgRating: 0, totalReviews: 0 });
 const [itemReviews, setItemReviews] = useState({ avgRating: 0, totalReviews: 0, reviews: [] });
 const [otherItems, setOtherItems] = useState([]);
 const [isWishlisted, setIsWishlisted] = useState(false);
 const [isLoading, setIsLoading] = useState(true);

 // Borrow state
 const [showReportModal, setShowReportModal] = useState(false);
 const [reportReason, setReportReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
 const fetchItem = async () => {
 try {
 const res = await itemService.getItemById(id);
 setItem(res.data);
 if (res.data?.ownerId) {
 try {
 const revRes = await reviewService.getUserReviews(res.data.ownerId);
 setOwnerReviews(revRes.data);
 } catch(e) {}
 try {
 const itemRevRes = await reviewService.getItemReviews(id);
 setItemReviews(itemRevRes.data);
 } catch(e) {}
 try {
 const itemsRes = await itemService.getItems({ ownerId: res.data.ownerId });
 setOtherItems(itemsRes.data.filter(i => i.id !== id).slice(0, 4));
 } catch(e) {}
 if (isAuthenticated) {
 try {
 const ws = await wishlistService.getWishlists();
 setIsWishlisted(ws.data.some(w => w.itemId === id));
 } catch(e) {}
 }
 }
 } catch (err) {
 toast.error('Barang tidak ditemukan');
 navigate('/items');
 } finally {
 setIsLoading(false);
 }
 };
 fetchItem();
 }, [id, navigate]);

 if (isLoading) {
 return (
 <div className="flex justify-center py-32 bg-background min-h-screen">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
 </div>
 );
 }

 if (!item) return null;

 const isOwner = user && user.id === item.ownerId;

 const handleContact = async () => {
 if (!isAuthenticated) {
 toast.error('Silakan login terlebih dahulu');
 navigate('/login', { state: { from: { pathname: `/items/${id}` } } });
 return;
 }

 try {
 toast.loading('Membuka obrolan...', { id: 'chat' });
 const res = await transactionService.createInquiry({ itemId: id });
 toast.dismiss('chat');
 navigate('/chat', { state: { selectedUser: item.owner, activeTxId: res.data.id } });
 } catch (err) {
 toast.error(err.response?.data?.message || 'Gagal memulai obrolan', { id: 'chat' });
 }
 };

 const handleWishlistToggle = async () => {
 if (!isAuthenticated) {
 toast.error('Silakan login terlebih dahulu');
 navigate('/login', { state: { from: { pathname: `/items/${id}` } } });
 return;
 }
 try {
 await wishlistService.toggleWishlist(id);
 setIsWishlisted(!isWishlisted);
 toast.success(isWishlisted ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist');
 } catch (err) {
 toast.error('Gagal mengupdate wishlist');
 }
 };

 const handleReportSubmit = async (e) => {
 e.preventDefault();
 if (!isAuthenticated) {
 toast.error('Silakan login terlebih dahulu');
 navigate('/login', { state: { from: { pathname: `/items/${id}` } } });
 return;
 }
 if (!reportReason.trim()) return;
 
 setIsSubmitting(true);
 try {
 await reportService.createReport({ reportedUserId: item.ownerId, reason: reportReason, itemId: item.id });
 toast.success('Laporan berhasil dikirim, terima kasih');
 setShowReportModal(false);
 setReportReason('');
 } catch (err) {
 toast.error('Gagal mengirim laporan');
 } finally {
 setIsSubmitting(false);
 }
 };

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
    return diff;
  };

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    setIsValidatingPromo(true);
    setPromoError('');
    try {
      const res = await promoService.validatePromo(promoCode);
      setAppliedPromo(res.data?.data || res.data);
      toast.success('Kode promo berhasil dipasang!');
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Kode promo tidak valid');
      setAppliedPromo(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    const basePrice = calculateDays() * item.hargaSewa;
    let discount = Math.floor(basePrice * (appliedPromo.discountPercent / 100));
    if (appliedPromo.maxDiscount && discount > appliedPromo.maxDiscount) {
      discount = appliedPromo.maxDiscount;
    }
    if (discount > basePrice) discount = basePrice;
    return discount;
  };

  const handleBorrowSubmit = async () => {
 if (!isAuthenticated) {
 toast.error('Silakan login terlebih dahulu');
 navigate('/login', { state: { from: { pathname: `/items/${id}` } } });
 return;
 }
    const days = calculateDays();
    if (days > item.maksimalHariPinjam) {
      toast.error(`Maksimal peminjaman adalah ${item.maksimalHariPinjam} hari`);
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      toast.error('Tanggal selesai tidak boleh lebih awal dari tanggal mulai');
      return;
    }

  setIsSubmitting(true);
  try {
  await transactionService.createRequest({
    itemId: item.id,
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    promoCode: appliedPromo ? promoCode : undefined
  });
  toast.success('Pengajuan pinjaman berhasil dikirim!');
 navigate('/transactions');
 } catch (err) {
 toast.error(err.response?.data?.message || 'Gagal mengajukan pinjaman');
 } finally {
 setIsSubmitting(false);
 }
 };
 
 const images = item.fotoBarang ? item.fotoBarang.split(',') : [];

 return (
 <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md antialiased overflow-x-hidden transition-colors duration-300">
 <main className="flex-grow dot-pattern relative overflow-hidden py-8 md:py-12">
 <div className="blob blob-1"></div>
 <div className="blob blob-2"></div>
 
 <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10">
 
 {/* Breadcrumb */}
 <Link to="/items" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md mb-8 group">
 <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
 Kembali ke Eksplorasi
 </Link>

 {/* Main Layout Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 
 {/* Left Column: Gallery & Info */}
 <div className="lg:col-span-7 flex flex-col gap-8">
 
 {/* Gallery Section */}
 <div className="glass-panel rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(0,74,198,0.05)] p-4 flex flex-col gap-4">
 {/* Main Image Area */}
 <div className="relative w-full h-[300px] md:h-[450px] bg-surface-variant/50 rounded-2xl flex items-center justify-center overflow-hidden border border-outline-variant/10">
 {images.length > 0 ? (
 <>
 <div className="absolute inset-0 z-0">
 <div 
 className="w-full h-full bg-cover bg-center blur-2xl opacity-40 scale-110"
 style={{ backgroundImage: `url(${UPLOADS_URL}${images[activeImageIdx]})` }}
 ></div>
 </div>
 <img 
 src={`${UPLOADS_URL}${images[activeImageIdx]}`}
 alt={item.namaBarang}
 className="relative z-10 w-full h-full object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
 />
 </>
 ) : (
 <div className="text-on-surface-variant flex items-center justify-center h-full">Tidak ada foto</div>
 )}
 </div>
 {/* Thumbnails */}
 {images.length > 1 && (
 <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x">
 {images.map((img, idx) => (
 <button 
 key={idx}
 onClick={() => setActiveImageIdx(idx)}
 className={`w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 snap-center focus:outline-none transition-all shadow-md ${activeImageIdx === idx ? 'border-primary opacity-100' : 'border-transparent opacity-70 hover:opacity-100 hover:border-primary/50'}`}
 >
 <img src={`${UPLOADS_URL}${img}`} className="w-full h-full object-cover" alt="" />
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Info Card */}
 <div className="glass-panel rounded-3xl p-8 shadow-[0_16px_40px_rgba(0,74,198,0.05)] flex flex-col gap-6">
 <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-6">
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/30 text-on-secondary-container font-label-sm text-label-sm border border-secondary-container/50">
 <span className="material-symbols-outlined text-[16px]">{getCategoryIcon(item.kategori)}</span> {item.kategori.replace('_', ' ')}
 </div>
 <span className={`inline-flex items-center gap-1 font-label-md text-label-md ${item.stok <= 0 || item.statusBarang === 'DIPINJAM' ? 'text-error' : 'text-secondary'}`}>
 <span className="material-symbols-outlined text-[18px]">
 {item.stok <= 0 || item.statusBarang === 'DIPINJAM' ? 'cancel' : 'check_circle'}
 </span> 
 {item.stok <= 0 || item.statusBarang === 'DIPINJAM' ? 'Disewa/Habis' : `Tersedia: ${item.stok} unit`}
 </span>
 </div>
 <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
 <div className="flex items-start gap-4">
 <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface font-extrabold leading-tight">{item.namaBarang}</h1>
 {!isOwner && (
 <button 
 onClick={handleWishlistToggle}
 className={`mt-1 p-2 rounded-full border transition-colors flex shrink-0 shadow-sm ${isWishlisted ? 'bg-error/10 border-error/20 text-error hover:bg-error/20' : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:text-error hover:bg-surface-variant'}`}
 title={isWishlisted ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
 >
 <span className="material-symbols-outlined text-[20px]" style={isWishlisted ? {fontVariationSettings:"'FILL' 1"} : {}}>{isWishlisted ? 'favorite' : 'favorite_border'}</span>
 </button>
 )}
 </div>
 <div className="flex flex-col lg:items-end shrink-0">
 <span className="font-display-lg text-2xl text-primary font-bold">
 {item.hargaSewa === 0 ? 'Gratis' : `Rp ${item.hargaSewa.toLocaleString('id-ID')}`}
 {item.hargaSewa > 0 && <span className="font-body-md text-sm text-on-surface-variant font-normal">/hari</span>}
 </span>
 </div>
 </div>
 </div>

 {/* Quick Specs */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-2">
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-2 text-outline mb-1">
 <span className="material-symbols-outlined text-[20px]">location_on</span>
 <span className="font-label-sm text-label-sm">Lokasi</span>
 </div>
 <span className="font-title-md text-base text-on-surface font-semibold">{item.lokasiPengambilan}</span>
 </div>
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-2 text-outline mb-1">
 <span className="material-symbols-outlined text-[20px]">schedule</span>
 <span className="font-label-sm text-label-sm">Maks Pinjam</span>
 </div>
 <span className="font-title-md text-base text-on-surface font-semibold">{item.maksimalHariPinjam} Hari</span>
 </div>
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-2 text-outline mb-1">
 <span className="material-symbols-outlined text-[20px]">verified</span>
 <span className="font-label-sm text-label-sm">Kondisi</span>
 </div>
 <span className="font-title-md text-base text-on-surface font-semibold">{item.kondisiBarang}</span>
 </div>
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-2 text-outline mb-1">
 <span className="material-symbols-outlined text-[20px]">star</span>
 <span className="font-label-sm text-label-sm">Rating Barang</span>
 </div>
 <span className="font-title-md text-base text-on-surface font-semibold">{itemReviews.avgRating} / 5.0</span>
 </div>
 </div>
 
 <hr className="border-outline-variant/20"/>
 
 {/* Description */}
 <div className="flex flex-col gap-4 pt-2">
 <h2 className="font-title-md text-xl text-on-surface font-bold">Deskripsi Barang</h2>
 <div className="font-body-md text-body-md text-on-surface-variant space-y-4 leading-relaxed whitespace-pre-wrap">
 {item.deskripsi}
 </div>
 </div>
 </div>
 </div>

 {/* Right Column: Sticky Action & Owner */}
 <div className="lg:col-span-5 flex flex-col gap-8 relative">
 <div className="sticky top-[88px] flex flex-col gap-8">
 
 {/* Borrow Action Card */}
 <div className="glass-panel rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,74,198,0.1)] flex flex-col gap-6 relative overflow-hidden group border-primary/20">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 z-0"></div>
 <div className="relative z-10 flex flex-col gap-6">
 {isOwner ? (
 <>
 <h3 className="font-display-lg text-2xl text-on-surface font-extrabold">Kelola Barang Anda</h3>
 <Link to={`/my-items/edit/${item.id}`} className="w-full bg-gradient-to-r from-primary to-surface-tint hover:from-surface-tint hover:to-primary text-on-primary font-title-md text-lg font-bold py-4 rounded-xl shadow-[0_8px_25px_rgba(0,74,198,0.3)] transition-all flex items-center justify-center gap-2">
 <span className="material-symbols-outlined">edit</span> Edit Barang
 </Link>
 </>
 ) : (
 <>
 <h3 className="font-display-lg text-2xl text-on-surface font-extrabold">Ajukan Pinjaman</h3>
 
 {/* Date Pickers */}
 <div className="grid grid-cols-2 gap-4">
 <div className="flex flex-col gap-2">
 <label className="font-label-md text-sm font-bold text-on-surface-variant">Tanggal Mulai</label>
 <div className="relative">
 <input 
 className="w-full rounded-xl border-outline-variant/30 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface px-4 py-3 shadow-sm outline-none cursor-pointer" 
 type="date"
 value={startDate}
 onClick={(e) => { if(e.target.showPicker) e.target.showPicker(); }}
 onKeyDown={(e) => e.preventDefault()}
 onChange={(e) => setStartDate(e.target.value)}
 min={new Date().toISOString().split('T')[0]}
 />
 </div>
 </div>
 <div className="flex flex-col gap-2">
 <label className="font-label-md text-sm font-bold text-on-surface-variant">Tanggal Selesai</label>
 <div className="relative">
 <input 
 className="w-full rounded-xl border-outline-variant/30 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface px-4 py-3 shadow-sm outline-none cursor-pointer" 
 type="date"
 value={endDate}
 onClick={(e) => { if(e.target.showPicker) e.target.showPicker(); }}
 onKeyDown={(e) => e.preventDefault()}
 onChange={(e) => setEndDate(e.target.value)}
 min={startDate || new Date().toISOString().split('T')[0]}
 />
 </div>
 </div>
 </div>

  {/* Promo Code Input */}
  <div className="flex flex-col gap-2">
    <label className="font-label-md text-sm font-bold text-on-surface-variant">Kode Promo (Opsional)</label>
    <div className="flex gap-2">
      <input 
        type="text" 
        className="flex-grow rounded-xl border-outline-variant/30 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface px-4 py-3 shadow-sm uppercase placeholder:normal-case" 
        placeholder="Masukkan kode promo"
        value={promoCode}
        onChange={(e) => {
          setPromoCode(e.target.value.toUpperCase().replace(/\s/g, ''));
          setPromoError('');
          if (appliedPromo) setAppliedPromo(null);
        }}
        disabled={!!appliedPromo}
      />
      {appliedPromo ? (
        <button 
          onClick={() => { setAppliedPromo(null); setPromoCode(''); }}
          className="px-4 py-3 rounded-xl bg-error/10 text-error font-bold font-title-sm hover:bg-error/20 transition-colors"
        >
          Hapus
        </button>
      ) : (
        <button 
          onClick={handleValidatePromo}
          disabled={!promoCode || isValidatingPromo}
          className="px-4 py-3 rounded-xl bg-surface-variant text-on-surface-variant font-bold font-title-sm hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50"
        >
          {isValidatingPromo ? 'Cek...' : 'Pakai'}
        </button>
      )}
    </div>
    {promoError && <span className="text-error text-xs font-medium pl-1">{promoError}</span>}
    {appliedPromo && <span className="text-primary text-xs font-medium pl-1">Diskon {appliedPromo.discountPercent}% berhasil dipakai!</span>}
  </div>

  {/* Cost Summary */}
  {startDate && endDate && (
  <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10 flex flex-col gap-3">
  <div className="flex justify-between font-label-md text-on-surface-variant">
  <span>Rp {item.hargaSewa.toLocaleString('id-ID')} x {calculateDays()} hari</span>
  <span>Rp {(calculateDays() * item.hargaSewa).toLocaleString('id-ID')}</span>
  </div>
  {appliedPromo && (
    <div className="flex justify-between font-label-md text-primary font-medium">
    <span>Diskon Promo ({appliedPromo.code})</span>
    <span>- Rp {calculateDiscount().toLocaleString('id-ID')}</span>
    </div>
  )}
  <div className="flex justify-between font-label-md text-on-surface-variant">
  <span>Biaya Layanan (tetap)</span>
  <span>Rp 5.000</span>
  </div>
  <hr className="border-outline-variant/20 my-2"/>
  <div className="flex justify-between font-display-lg text-xl text-on-surface font-bold items-center">
  <span>Total Biaya</span>
  <span className="text-primary text-2xl">Rp {(((calculateDays() * item.hargaSewa) - calculateDiscount()) + 5000).toLocaleString('id-ID')}</span>
  </div>
  </div>
  )}

  <button 
  onClick={handleBorrowSubmit}
  disabled={item.stok <= 0 || item.statusBarang !== 'TERSEDIA' || isSubmitting || !startDate || !endDate || (user && !user.isVerified && user.role !== 'OWNER' && user.role !== 'ADMIN')}
  className="w-full bg-gradient-to-r from-primary to-surface-tint hover:from-surface-tint hover:to-primary text-on-primary font-title-md text-lg font-bold py-4 rounded-xl shadow-[0_8px_25px_rgba(0,74,198,0.3)] transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
  >
  <span className="material-symbols-outlined text-[20px]">{user && !user.isVerified && user.role !== 'OWNER' && user.role !== 'ADMIN' ? 'lock' : 'send'}</span> 
  {user && !user.isVerified && user.role !== 'OWNER' && user.role !== 'ADMIN' ? 'Verifikasi KTM untuk Menyewa' : isSubmitting ? 'Memproses...' : 'Kirim Pengajuan'}
  </button>
 
 <div className="flex justify-center mt-2">
 <p className="font-label-sm text-center text-on-surface-variant">Anda belum akan dikenakan biaya sebelum pengajuan disetujui.</p>
 </div>
 </>
 )}
 </div>
 </div>

 {/* Owner Profile Card */}
 <div className="glass-panel rounded-3xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.05)] flex flex-col gap-6">
 <div className="flex items-center justify-between">
 <h3 className="font-display-lg text-xl text-on-surface font-extrabold">Informasi Pemilik</h3>
 {!isOwner && (
 <button onClick={() => setShowReportModal(true)} className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 font-label-md text-sm">
 <span className="material-symbols-outlined text-[18px]">flag</span> Laporkan
 </button>
 )}
 </div>
 
 <div className="flex items-center gap-5">
 <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-container relative shadow-md bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-2xl">
 {item.owner.nama.charAt(0).toUpperCase()}
 {item.owner.role === 'ADMIN' && (
 <div className="absolute bottom-0 right-0 bg-secondary text-white rounded-full p-0.5 flex items-center justify-center ring-2 ring-surface-container-lowest">
 <span className="material-symbols-outlined text-[10px]">verified</span>
 </div>
 )}
 </div>
 <div className="flex flex-col flex-grow">
 <span className="font-title-md text-lg text-on-surface font-bold leading-tight">{item.owner.nama}</span>
 {item.owner.universitas && (
 <span className="font-label-md text-sm text-primary font-semibold mt-0.5"><span className="material-symbols-outlined text-[14px] align-middle mr-1">school</span>{item.owner.universitas}</span>
 )}
 <div className="flex items-center gap-1 mt-2">
 <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
 <span className="font-label-md text-sm text-on-surface font-bold">{ownerReviews.avgRating}</span>
 <span className="font-label-sm text-xs text-on-surface-variant">({ownerReviews.totalReviews} Transaksi)</span>
 </div>
 </div>
 </div>
 
 <button onClick={handleContact} className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-title-md font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
 <span className="material-symbols-outlined text-[20px]">chat</span> Chat Pemilik
 </button>
 </div>
 </div>
 </div>

 </div>
 </div>
 </main>

 {/* Report Modal */}
 {showReportModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-background/50 backdrop-blur-sm p-margin-mobile" id="reportModal">
 <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant/20 flex flex-col overflow-hidden">
 <div className="px-8 py-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface/50">
 <h3 className="font-display-lg text-xl text-on-surface font-extrabold">Laporkan Barang/Pemilik</h3>
 <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-variant/50" onClick={() => setShowReportModal(false)}>
 <span className="material-symbols-outlined">close</span>
 </button>
 </div>
 
 <form onSubmit={handleReportSubmit}>
 <div className="p-8 flex flex-col gap-6">
 <p className="font-body-md text-on-surface-variant">Silakan pilih alasan pelaporan Anda. Laporan akan ditinjau oleh tim kami secara anonim.</p>
 <div className="flex flex-col gap-3">
 {['Barang fiktif / penipuan', 'Deskripsi tidak sesuai aslinya', 'Bahasa / perilaku tidak pantas', 'Lainnya'].map((reason) => (
 <label key={reason} className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low cursor-pointer transition-colors group">
 <input 
 type="radio" 
 name="report_reason" 
 className="text-primary focus:ring-primary w-4 h-4 border-outline-variant rounded-sm"
 checked={reportReason.includes(reason) || (reason === 'Lainnya' && reportReason && !['Barang fiktif / penipuan', 'Deskripsi tidak sesuai aslinya', 'Bahasa / perilaku tidak pantas'].includes(reportReason))}
 onChange={() => setReportReason(reason)}
 />
 <span className="font-label-md text-on-surface group-hover:text-primary transition-colors font-medium">{reason}</span>
 </label>
 ))}
 </div>
 {(!['Barang fiktif / penipuan', 'Deskripsi tidak sesuai aslinya', 'Bahasa / perilaku tidak pantas', ''].includes(reportReason) || reportReason === 'Lainnya') && (
 <div className="flex flex-col gap-2 mt-2">
 <label className="font-label-md text-sm font-bold text-on-surface-variant">Detail Tambahan (Opsional)</label>
 <textarea 
 className="w-full rounded-xl border-outline-variant/30 bg-surface focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface p-4 h-24 resize-none shadow-sm" 
 placeholder="Ceritakan lebih lanjut masalah yang Anda temui..."
 value={reportReason === 'Lainnya' ? '' : reportReason}
 onChange={(e) => setReportReason(e.target.value)}
 ></textarea>
 </div>
 )}
 </div>
 <div className="px-8 py-5 border-t border-outline-variant/20 bg-surface-container-low flex justify-end gap-3">
 <button type="button" className="px-6 py-2.5 font-title-md font-bold text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors" onClick={() => setShowReportModal(false)}>Batal</button>
 <button type="submit" disabled={isSubmitting || !reportReason} className="px-6 py-2.5 font-title-md font-bold bg-error hover:bg-on-error-container text-white rounded-xl shadow-[0_4px_12px_rgba(186,26,26,0.2)] transition-colors flex items-center gap-2 disabled:opacity-50">
 {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Hide Scrollbar Style */}
 <style>{`
 .no-scrollbar::-webkit-scrollbar { display: none; }
 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
 `}</style>
 </div>
 );
};

export default ItemDetail;
