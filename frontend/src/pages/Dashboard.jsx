import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import transactionService from '../services/transaction.service';
import ownerService from '../services/owner.service';
import itemService from '../services/item.service';
import { getWalletInfo } from '../services/wallet.service';
import chatService from '../services/chat.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [walletInfo, setWalletInfo] = useState({ balance: 0 });
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, itemsRes, walletRes, chatRes, recomRes] = await Promise.allSettled([
          transactionService.getDashboardStats(),
          ownerService.getTopItems(),
          getWalletInfo(),
          chatService.getConversations(),
          itemService.getItems({ limit: 3 })
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data || null);
        if (itemsRes.status === 'fulfilled') setTopItems(itemsRes.value?.data || []);
        if (walletRes.status === 'fulfilled') setWalletInfo(walletRes.value || { balance: 0 });
        if (chatRes.status === 'fulfilled') setMessages(chatRes.value?.data || []);
        if (recomRes.status === 'fulfilled') setRecommendations(recomRes.value?.data || []);

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
      <div className="flex justify-center items-center py-32 bg-background min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md antialiased overflow-x-hidden">
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-stack-lg flex flex-col gap-stack-lg dot-pattern">
        
        {/* Hero Profile Section */}
        <header className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-container/10 rounded-full blur-2xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
            <div className="flex items-center gap-6 z-10">
                <div className="w-20 h-20 rounded-2xl bg-surface-variant flex items-center justify-center shadow-inner overflow-hidden border-2 border-white">
                    {user?.fotoProfil ? (
                        <img alt={user?.nama} className="w-full h-full object-cover" src={`${UPLOADS_URL}${user.fotoProfil}`} />
                    ) : (
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="font-headline-lg text-headline-lg md:text-3xl text-on-surface font-extrabold tracking-tight">Halo, {user?.nama?.split(' ')[0]} 👋</h1>
                        {user?.role === 'ADMIN' && (
                            <div className="flex items-center gap-1 bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                                <span className="material-symbols-outlined text-secondary text-sm">verified</span>
                                <span className="font-label-sm text-label-sm text-secondary font-bold">Terverifikasi</span>
                            </div>
                        )}
                    </div>
                    <p className="text-on-surface-variant font-body-md text-body-md">{user?.universitas || 'Mahasiswa'}</p>
                    <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm font-label-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-tertiary text-lg" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
                            <span className="font-bold text-on-surface">4.9</span> (0 Review)
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-label-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-primary text-lg" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                            <span>{stats?.myItemsBorrowed || 0} Transaksi Sukses</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-3 z-10 w-full md:w-auto">
                <Link to="/profile" className="flex-1 md:flex-none bg-surface-container hover:bg-surface-variant text-on-surface px-5 py-2.5 rounded-xl font-label-md text-label-md transition-all shadow-sm border border-outline-variant/30 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                    Edit Profil
                </Link>
                <Link to="/items/new" className="flex-1 md:flex-none bg-primary-container text-on-primary-container hover:bg-primary-container/90 px-5 py-2.5 rounded-xl font-label-md text-label-md transition-all shadow-md shadow-primary-container/20 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Upload Barang
                </Link>
            </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">
            
            {/* Left Column (Main Content) - 8 cols */}
            <div className="lg:col-span-8 flex flex-col gap-stack-lg">
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-panel rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32 border-l-4 border-l-primary-container border-y border-r border-outline-variant/20">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-primary-container bg-primary-container/10 p-2 rounded-xl">inventory_2</span>
                        </div>
                        <div>
                            <div className="font-headline-lg text-2xl text-on-surface font-extrabold group-hover:scale-105 origin-left transition-transform">{stats?.myItemsCount || 0}</div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">Total Barang Saya</span>
                        </div>
                    </div>
                    <div className="glass-panel rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32 border-l-4 border-l-secondary border-y border-r border-outline-variant/20">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-xl">outbox</span>
                        </div>
                        <div>
                            <div className="font-headline-lg text-2xl text-on-surface font-extrabold group-hover:scale-105 origin-left transition-transform">{stats?.myItemsBorrowed || 0}</div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">Sedang Dipinjamkan</span>
                        </div>
                    </div>
                    <div className="glass-panel rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32 border-l-4 border-l-tertiary border-y border-r border-outline-variant/20">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-xl">shopping_basket</span>
                        </div>
                        <div>
                            <div className="font-headline-lg text-2xl text-on-surface font-extrabold group-hover:scale-105 origin-left transition-transform">{stats?.activeBorrowingsCount || 0}</div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">Pinjaman Aktif</span>
                        </div>
                    </div>
                    <div className="bg-error/5 dark:bg-error/10 backdrop-blur-md rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32 border-l-4 border-l-error border-y border-r border-error/20">
                        <div className="flex justify-between items-start">
                            <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-xl">warning</span>
                            {stats?.actionNeededCount > 0 && <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">Aksi!</span>}
                        </div>
                        <div>
                            <div className="font-headline-lg text-2xl text-error font-extrabold group-hover:scale-105 origin-left transition-transform">{stats?.actionNeededCount || 0}</div>
                            <span className="font-label-sm text-label-sm text-error">Tindakan Diperlukan</span>
                        </div>
                    </div>
                </div>

                {/* Jadwal Pengembalian */}
                <section className="flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <h2 className="font-title-md text-title-md text-on-surface font-bold">Jadwal Pengembalian</h2>
                        <Link to="/transactions" className="text-primary-container font-label-sm hover:underline flex items-center gap-1">Lihat Transaksi <span className="material-symbols-outlined text-[16px]">arrow_forward</span></Link>
                    </div>
                    <div className="glass-panel rounded-2xl p-2 shadow-sm flex flex-col gap-2">
                        {stats?.reminders && stats.reminders.length > 0 ? (
                            stats.reminders.map(rem => {
                                const endDate = new Date(rem.endDate);
                                const today = new Date();
                                const isOverdue = endDate < today;
                                const isToday = endDate.toDateString() === today.toDateString();
                                const timeStr = endDate.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});

                                return (
                                    <div key={rem.id} className="bg-surface p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center relative overflow-hidden group hover:bg-surface-variant/50 transition-colors">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isOverdue ? 'bg-error' : (isToday ? 'bg-tertiary' : 'bg-primary')}`}></div>
                                        <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden shrink-0">
                                            {rem.item?.fotoBarang ? (
                                                <img alt={rem.item.namaBarang} className="w-full h-full object-cover" src={`${UPLOADS_URL}${rem.item.fotoBarang.split(',')[0]}`} />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-on-surface-variant w-full h-full flex justify-center items-center">category</span>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                {isOverdue ? (
                                                    <span className="bg-error/10 text-error px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Terlambat</span>
                                                ) : isToday ? (
                                                    <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Hari Ini, {timeStr} WIB</span>
                                                ) : (
                                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Segera</span>
                                                )}
                                            </div>
                                            <h3 className="font-label-md text-base text-on-surface font-bold">{rem.item?.namaBarang}</h3>
                                            <p className="font-label-sm text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-[14px]">person</span> Partner: {rem.item?.ownerId === user.id ? rem.user?.nama : rem.item?.owner?.nama}
                                            </p>
                                        </div>
                                        <div className="w-full sm:w-auto flex gap-2">
                                            <Link to={`/chat`} className="flex-1 sm:flex-none bg-surface-container hover:bg-surface-variant px-4 py-2 rounded-lg font-label-sm transition-colors border border-outline-variant/30 flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-[16px]">chat</span> Chat
                                            </Link>
                                            <Link to={`/transactions/${rem.id}`} className={`flex-1 sm:flex-none ${isOverdue ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-primary-container text-on-primary-container hover:bg-primary-container/90 shadow-sm'} px-6 py-2 rounded-lg font-label-sm font-bold transition-colors text-center`}>
                                                Detail
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="p-8 flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">event_available</span>
                                <p className="font-label-md text-on-surface-variant">Tidak ada jadwal pengembalian dalam waktu dekat.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Rekomendasi Terdekat */}
                <section className="flex flex-col gap-4 mt-2">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="font-title-md text-title-md text-on-surface font-bold">Rekomendasi di Sekitarmu</h2>
                            <p className="text-sm text-on-surface-variant">Berdasarkan lokasi: {user?.universitas || 'Sekitarmu'}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link to="/items" className="text-primary-container font-label-sm hover:underline flex items-center gap-1">Eksplor <span className="material-symbols-outlined text-[16px]">arrow_forward</span></Link>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {recommendations && recommendations.length > 0 ? (
                            recommendations.map(item => (
                                <Link to={`/items/${item.id}`} key={item.id} className="glass-panel rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-3">
                                    <div className="aspect-square rounded-xl bg-surface-container overflow-hidden relative">
                                        <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 text-[10px] font-bold z-10">
                                            <span className="material-symbols-outlined text-[12px] text-primary-container">location_on</span> {item.lokasiPengambilan || 'Terdekat'}
                                        </div>
                                        {item.fotoBarang ? (
                                            <img alt={item.namaBarang} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} />
                                        ) : (
                                            <span className="material-symbols-outlined text-4xl text-on-surface-variant w-full h-full flex justify-center items-center group-hover:scale-105 transition-transform duration-500">category</span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-label-md font-bold text-on-surface truncate">{item.namaBarang}</h4>
                                        <p className="text-xs text-on-surface-variant mt-1">Mulai <span className="font-bold text-secondary">Rp {(item.hargaSewa || 0).toLocaleString('id-ID')}/hari</span></p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full p-8 text-center text-outline-variant bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
                                Belum ada rekomendasi barang.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Right Column (Sidebar) - 4 cols */}
            <div className="lg:col-span-4 flex flex-col gap-stack-lg">
                
                {/* Dompet & Transaksi */}
                <div className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div>
                        <h2 className="font-title-md text-title-md text-on-surface font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">account_balance_wallet</span> Dompet Rent
                        </h2>
                    </div>
                    <div>
                        <p className="text-sm text-on-surface-variant mb-1">Saldo Aktif</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="font-headline-lg text-4xl text-on-surface font-extrabold tracking-tight">
                                Rp {(walletInfo?.balance || 0).toLocaleString('id-ID')}
                            </h3>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/wallet" className="flex-1 bg-surface-container hover:bg-surface-variant text-on-surface py-2.5 rounded-xl font-label-md text-label-md transition-all shadow-sm border border-outline-variant/30 flex items-center justify-center gap-2 text-center">
                            <span className="material-symbols-outlined text-[18px]">history</span> Riwayat
                        </Link>
                        <Link to="/wallet" className="flex-1 bg-on-surface text-surface py-2.5 rounded-xl font-label-md text-label-md transition-all shadow-md hover:bg-on-surface/90 flex items-center justify-center gap-2 text-center">
                            <span className="material-symbols-outlined text-[18px]">account_balance</span> Buka Dompet
                        </Link>
                    </div>
                </div>

                {/* Pesan Baru */}
                <div className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-title-md text-title-md text-on-surface font-bold flex items-center gap-2">
                            Pesan Baru
                            {messages.filter(c => c.lastMessage).length > 0 && <span className="bg-error text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{messages.filter(c => c.lastMessage).length}</span>}
                        </h2>
                        <Link to="/chat" className="text-primary-container text-sm font-bold hover:underline">Lihat Semua</Link>
                    </div>
                    <div className="flex flex-col gap-1">
                        {messages && messages.filter(c => c.lastMessage).length > 0 ? (
                            messages.filter(c => c.lastMessage).slice(0, 3).map((conv, index, arr) => {
                                const partner = conv.partner || {};
                                const lastMessage = conv.lastMessage?.text || 'Pesan gambar/file';
                                
                                return (
                                    <div key={conv.transactionId || index}>
                                        <Link to={`/chat?c=${conv.transactionId}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-variant/50 transition-colors group">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-primary-container/20 overflow-hidden flex items-center justify-center">
                                                    {partner.fotoProfil ? (
                                                        <img alt={partner.nama} src={`${UPLOADS_URL}${partner.fotoProfil}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-primary-container">person</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h4 className="font-label-md font-bold text-on-surface truncate">{partner.nama || 'Pengguna'}</h4>
                                                </div>
                                                <p className="text-xs text-on-surface-variant truncate">{lastMessage}</p>
                                            </div>
                                        </Link>
                                        {index < arr.length - 1 && <div className="h-px bg-outline-variant/20 w-full my-1"></div>}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center p-4 text-on-surface-variant text-sm">
                                Belum ada pesan baru.
                            </div>
                        )}
                    </div>
                </div>

                {/* Barang Terpopuler Anda */}
                <div className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                    <h3 className="font-title-md text-title-md text-on-surface font-bold">Barang Terpopuler Anda</h3>
                    <div className="flex flex-col gap-3">
                        {topItems && topItems.length > 0 ? (
                            topItems.slice(0,3).map((item, index) => (
                                <Link to={`/items/${item.id}`} key={item.id} className="flex items-center gap-3 group hover:bg-surface/50 p-2 rounded-xl transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-surface-container text-on-surface-variant font-extrabold flex items-center justify-center shrink-0 text-lg border border-outline-variant/20 group-hover:bg-primary-container/10 group-hover:text-primary-container group-hover:border-primary-container/20 transition-colors">
                                        {index + 1}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="font-label-md text-sm text-on-surface font-bold truncate group-hover:text-primary-container transition-colors">{item.namaBarang}</p>
                                        <p className="text-xs text-on-surface-variant">Disewa {item.totalTransactions || 0} kali</p>
                                    </div>
                                    <span className="text-secondary font-bold text-sm shrink-0">Rp {(item.hargaSewa/1000).toFixed(0)}k</span>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center p-4 text-on-surface-variant text-sm flex flex-col items-center">
                                <span className="material-symbols-outlined text-3xl mb-2 opacity-50">inventory</span>
                                Belum ada barang yang disewa.
                            </div>
                        )}
                    </div>
                    <Link to="/my-items" className="mt-2 w-full bg-surface-container hover:bg-surface-variant py-2.5 rounded-xl text-primary-container font-label-md text-sm transition-colors font-bold text-center border border-outline-variant/20">
                        Lihat Katalog Anda
                    </Link>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
