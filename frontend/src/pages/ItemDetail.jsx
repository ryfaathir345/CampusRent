import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Tag, User, MessageCircle, ChevronLeft, ShieldCheck, Star, GraduationCap, Heart, AlertTriangle } from 'lucide-react';
import itemService from '../services/item.service';
import transactionService from '../services/transaction.service';
import reviewService from '../services/review.service';
import wishlistService from '../services/wishlist.service';
import reportService from '../services/report.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

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
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
      <div className="flex justify-center py-32 bg-gray-50 dark:bg-slate-900 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

    setIsSubmitting(true);
    try {
      await transactionService.createRequest({
        itemId: item.id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      });
      toast.success('Pengajuan pinjaman berhasil dikirim!');
      navigate('/transactions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengajukan pinjaman');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <Link to="/items" className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6 font-medium">
          <ChevronLeft size={20} />
          Kembali ke Eksplorasi
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Kolom Kiri */}
          <div className="w-full lg:w-[60%] flex flex-col gap-6">
            
            {/* Foto Section */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="bg-gray-100 dark:bg-slate-700 relative flex flex-col">
                {item.fotoBarang ? (
                  <>
                    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden flex items-center justify-center bg-black/5 dark:bg-black/20">
                      {/* Blurred background */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center blur-2xl scale-125 opacity-40 dark:opacity-30"
                        style={{ backgroundImage: `url(${UPLOADS_URL}${item.fotoBarang.split(',')[activeImageIdx]})` }}
                      ></div>
                      {/* Main image */}
                      <img 
                        src={`${UPLOADS_URL}${item.fotoBarang.split(',')[activeImageIdx]}`} 
                        alt={item.namaBarang}
                        className="w-full h-full object-contain relative z-10 drop-shadow-lg" 
                      />
                    </div>
                    {item.fotoBarang.split(',').length > 1 && (
                      <div className="flex gap-2 p-4 overflow-x-auto bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 relative z-20">
                        {item.fotoBarang.split(',').map((img, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setActiveImageIdx(idx)}
                            className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImageIdx === idx ? 'border-blue-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          >
                            <img src={`${UPLOADS_URL}${img}`} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-[300px] md:h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
                    Tidak ada foto
                  </div>
                )}
              </div>
            </div>

            {/* Detail Section */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-3">
                <Tag size={14} />
                {item.kategori.replace('_', ' ')}
              </div>

              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{item.namaBarang}</h1>
                {!isOwner && (
                  <button 
                    onClick={handleWishlistToggle}
                    className={`p-2.5 rounded-full flex-shrink-0 transition-colors border shadow-sm ${isWishlisted ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-500' : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'}`}
                    title={isWishlisted ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
                  >
                    <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-6 pb-6 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-slate-100">
                    {item.hargaSewa === 0 ? 'Gratis' : `Rp ${item.hargaSewa.toLocaleString('id-ID')}`}
                  </span>
                  <span className="text-gray-500 font-medium">/hari</span>
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {item.stok <= 0 || item.statusBarang === 'DIPINJAM' ? 'Status: Disewa / Habis' : `Tersedia: ${item.stok} unit`}
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex gap-3 text-gray-600 dark:text-slate-400">
                  <MapPin className="flex-shrink-0 text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wider mb-0.5">Lokasi Pengambilan</p>
                    <p className="font-medium text-gray-900 dark:text-slate-200">{item.lokasiPengambilan}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 text-gray-600 dark:text-slate-400">
                  <Clock className="flex-shrink-0 text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wider mb-0.5">Maksimal Peminjaman</p>
                    <p className="font-medium text-gray-900 dark:text-slate-200">{item.maksimalHariPinjam} Hari</p>
                  </div>
                </div>

                <div className="flex gap-3 text-gray-600 dark:text-slate-400">
                  <ShieldCheck className="flex-shrink-0 text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wider mb-0.5">Kondisi Barang</p>
                    <p className="font-medium text-gray-900 dark:text-slate-200">{item.kondisiBarang}</p>
                  </div>
                </div>
              </div>

              <div className="">
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-2">Deskripsi Barang</h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.deskripsi}
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            {itemReviews.reviews?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">
                  Penilaian Produk
                </h3>
                
                <div className="flex items-center gap-6 p-6 mb-6 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl">
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold text-orange-500 mb-1">
                      {itemReviews.avgRating} <span className="text-lg font-normal text-orange-400">/ 5</span>
                    </div>
                    <div className="flex text-orange-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className={i < Math.round(parseFloat(itemReviews.avgRating)) ? 'fill-current' : 'text-orange-200 dark:text-slate-700'} />
                      ))}
                    </div>
                  </div>
                  <div className="h-16 w-px bg-orange-200 dark:bg-orange-900/50 hidden sm:block"></div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Semua Ulasan ({itemReviews.reviews.length})</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-orange-200 dark:border-slate-700 text-orange-600 dark:text-orange-400 text-xs rounded-full cursor-pointer hover:bg-orange-50 transition-colors">Semua</span>
                      <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 text-xs rounded-full cursor-pointer hover:bg-gray-50 transition-colors">Dengan Komentar</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-0 divide-y divide-gray-100 dark:divide-slate-800">
                  {itemReviews.reviews.map(rev => (
                    <div key={rev.id} className="py-5">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                          {rev.reviewer.nama.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm mb-0.5">{rev.reviewer.nama}</p>
                          <div className="flex text-orange-400 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={i < rev.rating ? 'fill-current' : 'text-gray-200 dark:text-slate-700'} />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">{new Date(rev.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          {rev.comment && (
                            <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">{rev.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rekomendasi Barang Lain */}
            {otherItems.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-6">Barang Lain dari Pemilik Ini</h3>
                <div className="grid grid-cols-2 gap-4">
                  {otherItems.map(item => (
                    <Link key={item.id} to={`/items/${item.id}`} className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-blue-100 dark:hover:border-slate-600 transition-all duration-300">
                      <div className="w-full aspect-square bg-gray-100 dark:bg-slate-700 relative overflow-hidden">
                        {item.fotoBarang ? (
                          <img src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} alt={item.namaBarang} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-1 truncate" title={item.namaBarang}>{item.namaBarang}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <Tag size={10} /> {item.kategori.replace('_', ' ')}
                        </div>
                        <p className="font-bold text-blue-600">{item.hargaSewa === 0 ? 'Gratis' : `Rp ${item.hargaSewa.toLocaleString('id-ID')}`}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Kolom Kanan (Sticky) */}
          <div className="w-full lg:w-[40%] flex flex-col gap-6 lg:sticky lg:top-24">
            
            {/* Owner Box */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                  {item.owner.nama.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg">{item.owner.nama}</h3>
                  {item.owner.universitas && (
                    <p className="text-xs font-medium text-purple-600 flex items-center gap-1 mt-0.5"><GraduationCap size={12} /> {item.owner.universitas}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 dark:text-slate-400 mt-1">
                    <Star size={14} className="text-yellow-400 fill-current mr-1" />
                    <span className="font-semibold text-gray-700 dark:text-slate-300 mr-1">{ownerReviews.avgRating}</span>
                    <span>({ownerReviews.totalReviews} ulasan)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleContact}
                  className="flex-1 py-2.5 px-4 bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} /> Chat Pemilik
                </button>
                {!isOwner && (
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="p-2.5 text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors border border-gray-200 dark:border-slate-600"
                    title="Laporkan"
                  >
                    <AlertTriangle size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Borrow Box */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
              {isOwner ? (
                <Link to={`/my-items/edit/${item.id}`} className="btn-secondary py-3 px-6 whitespace-nowrap w-full text-center block">
                  Edit Barang
                </Link>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={() => setShowBorrowForm(!showBorrowForm)}
                    disabled={item.stok <= 0 || item.statusBarang !== 'TERSEDIA'}
                    className={`btn-primary py-3 px-6 w-full flex items-center justify-center gap-2 ${(item.stok <= 0 || item.statusBarang !== 'TERSEDIA') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Ajukan Pinjaman
                  </button>

                  {/* Borrow Form Modal/Section */}
                  {showBorrowForm && (
                    <div className="bg-blue-50/50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50 mt-4 animate-in fade-in slide-in-from-top-4">
                      <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-4">Pilih Tanggal Peminjaman</h4>
                      <div className="flex flex-col gap-4 mb-4">
                        <div>
                          <label className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-1 block">Tanggal Mulai</label>
                          <input 
                            type="date" 
                            className="form-input text-sm py-2 w-full"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-1 block">Tanggal Selesai</label>
                          <input 
                            type="date" 
                            className="form-input text-sm py-2 w-full"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-blue-100/50 dark:border-blue-800/30">
                        <div className="flex justify-between items-end mb-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">Sewa ({calculateDays()} hari) + Biaya Layanan</p>
                            <p className="font-bold text-blue-700 text-lg">
                              {`Rp ${((calculateDays() * item.hargaSewa) + 5000).toLocaleString('id-ID')}`}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={handleBorrowSubmit}
                          disabled={isSubmitting || !startDate || !endDate}
                          className="btn-primary py-2 w-full"
                        >
                          {isSubmitting ? 'Memproses...' : 'Kirim Pengajuan'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="text-red-500" /> Laporkan
                </h3>
                <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="sr-only">Tutup</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleReportSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Alasan laporan:</label>
                  <textarea
                    className="w-full form-input bg-gray-50 dark:bg-slate-700/50 min-h-[100px] resize-none"
                    placeholder="Misal: Barang rusak, penipuan, spam..."
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowReportModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmitting || !reportReason.trim()} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50">
                    {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ItemDetail;
