import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import itemService from '../services/item.service';
import * as walletService from '../services/wallet.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Sidebar from '../components/common/Sidebar';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const MyItems = () => {
 const { user } = useAuth();
 const navigate = useNavigate();
 const [items, setItems] = useState([]);
 const [walletInfo, setWalletInfo] = useState({ saldo: 0 });
 const [isLoading, setIsLoading] = useState(true);

 const fetchData = useCallback(async () => {
  setIsLoading(true);
  try {
   const [itemsRes, walletRes] = await Promise.all([
    itemService.getItems({ ownerId: user.id }),
    walletService.getWalletInfo()
   ]);
   setItems(itemsRes.data || []);
   setWalletInfo(walletRes.data || { saldo: 0 });
  } catch (err) {
   console.error(err);
   toast.error('Gagal memuat data barang');
  } finally {
   setIsLoading(false);
  }
 }, [user.id]);

 useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchData();
 }, [fetchData]);

 const handleDelete = async (id) => {
  if (!window.confirm('Yakin ingin menghapus barang ini?')) return;
  try {
   await itemService.deleteItem(id);
   toast.success('Barang berhasil dihapus');
   fetchData();
  } catch (error) {
   console.error(error);
   toast.error('Gagal menghapus barang');
  }
 };

 const countTersedia = items.filter(i => i.statusBarang === 'TERSEDIA').length;
 const countDipinjam = items.filter(i => i.statusBarang !== 'TERSEDIA').length;

 return (
  <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col dot-pattern">
   <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-gutter py-stack-xl flex flex-col md:flex-row gap-gutter">
    
    <Sidebar activeTab="my-items" />

    {/* Main Content Canvas */}
    <div className="flex-1 flex flex-col gap-stack-xl min-w-0">
     {/* Hero/Header Section */}
     <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
      <div>
       <h1 className="font-headline-lg text-headline-lg text-on-surface">Kelola Barang Saya</h1>
       <p className="text-body-md text-on-surface-variant mt-2">Pantau, tambah, dan optimalkan barang sewaan Anda di sini.</p>
      </div>
      <button 
       onClick={() => {
        if (!user.isVerified) {
         toast.error('Harap unggah KTM di profil Anda dan tunggu verifikasi untuk menambah barang');
        } else {
         navigate('/my-items/create');
        }
       }}
       className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
      >
       <span className="material-symbols-outlined">add</span>
       <span>Tambah Barang Baru</span>
      </button>
     </div>

     {/* Statistics Row */}
     <div className="grid grid-cols-2 lg:grid-cols-4 gap-stack-md">
      <div className="glass-panel shadow-sm p-stack-md rounded-xl border border-outline-variant/20 hover:-translate-y-1 transition-transform">
       <p className="text-label-sm text-on-surface-variant">Total Barang</p>
       <h3 className="font-headline-lg text-headline-lg text-primary">{items.length}</h3>
       <div className="flex items-center gap-1 text-secondary text-[10px] mt-1 font-semibold">
        <span className="material-symbols-outlined text-[14px]">inventory_2</span> Koleksi Anda
       </div>
      </div>
      <div className="glass-panel shadow-sm p-stack-md rounded-xl border border-outline-variant/20 hover:-translate-y-1 transition-transform">
       <p className="text-label-sm text-on-surface-variant">Tersedia</p>
       <h3 className="font-headline-lg text-headline-lg text-secondary">{countTersedia}</h3>
       <p className="text-[10px] text-on-surface-variant mt-1 font-semibold">Siap dipinjam</p>
      </div>
      <div className="glass-panel shadow-sm p-stack-md rounded-xl border border-outline-variant/20 hover:-translate-y-1 transition-transform">
       <p className="text-label-sm text-on-surface-variant">Sedang Dipinjam</p>
       <h3 className="font-headline-lg text-headline-lg text-tertiary">{countDipinjam}</h3>
       <p className="text-[10px] text-on-surface-variant mt-1 font-semibold">Dalam transaksi aktif</p>
      </div>
      <div className="glass-panel shadow-sm p-stack-md rounded-xl border border-outline-variant/20 hover:-translate-y-1 transition-transform">
       <p className="text-label-sm text-on-surface-variant">Saldo Tersedia</p>
       <h3 className="font-title-md text-title-md text-on-surface mt-2 font-bold">Rp {walletInfo.saldo.toLocaleString('id-ID')}</h3>
       <div className="flex items-center gap-1 text-secondary text-[10px] mt-2 font-semibold">
        <span className="material-symbols-outlined text-[14px]">payments</span> Siap ditarik
       </div>
      </div>
     </div>

     {isLoading ? (
      <div className="flex justify-center py-20">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
     ) : items.length === 0 ? (
      <div className="glass-panel p-10 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col items-center justify-center text-center">
       <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center text-on-surface-variant opacity-50 mb-4">
        <span className="material-symbols-outlined text-[40px]">inventory_2</span>
       </div>
       <h3 className="font-title-md text-[20px] text-on-surface mb-2 font-semibold">Belum ada barang</h3>
       <p className="font-body-md text-on-surface-variant mb-6 max-w-sm">Mulai tambahkan barang pertamamu untuk disewakan dan dapatkan penghasilan.</p>
       <button 
        onClick={() => {
         if (!user.isVerified) {
          toast.error('Harap unggah KTM di profil Anda dan tunggu verifikasi untuk menambah barang');
         } else {
          navigate('/my-items/create');
         }
        }}
        className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-md text-[14px] shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all font-semibold"
       >
        Tambah Barang Baru
       </button>
      </div>
     ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
       {items.map(item => (
        <div key={item.id} className="glass-panel shadow-sm rounded-xl overflow-hidden border border-outline-variant/20 group hover:-translate-y-1 transition-all flex flex-col">
         <div className="relative h-48 overflow-hidden bg-surface-container-high shrink-0">
          {item.fotoBarang ? (
           <img 
            src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} 
            alt={item.namaBarang} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
           />
          ) : (
           <div className="w-full h-full flex items-center justify-center text-on-surface-variant opacity-50">
            <span className="material-symbols-outlined text-[40px]">image</span>
           </div>
          )}
          
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-label-sm font-bold shadow-sm ${item.statusBarang === 'TERSEDIA' ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'}`}>
           {item.statusBarang === 'TERSEDIA' ? 'Tersedia' : 'Dipinjam'}
          </span>
         </div>
         
         <div className="p-stack-md flex flex-col gap-stack-sm flex-grow">
          <div className="flex justify-between items-start gap-2">
           <Link to={`/items/${item.id}`} className="font-title-md text-title-md text-on-surface line-clamp-1 hover:text-primary transition-colors">
            {item.namaBarang}
           </Link>
           <span className="text-primary font-bold whitespace-nowrap">
            Rp {item.hargaSewa.toLocaleString('id-ID')}
            <span className="text-[10px] font-normal text-on-surface-variant">/hari</span>
           </span>
          </div>
          
          <div className="flex items-center gap-2">
           <span className="material-symbols-outlined text-tertiary text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
           <span className="text-label-sm text-on-surface-variant">0 (Belum ada ulasan)</span>
          </div>
          
          <div className="flex gap-2 pt-stack-xs mt-auto">
           <Link to={`/my-items/edit/${item.id}`} className="flex-1 py-2 flex justify-center items-center bg-surface-container-high hover:bg-primary/10 text-primary rounded-lg font-bold text-label-sm transition-colors">
            Edit
           </Link>
           <button onClick={() => handleDelete(item.id)} className="p-2 border border-outline-variant hover:bg-error/10 text-error rounded-lg transition-colors flex justify-center items-center" title="Hapus Barang">
            <span className="material-symbols-outlined text-[20px]">delete</span>
           </button>
          </div>
         </div>
        </div>
       ))}
      </div>
     )}
    </div>
   </main>
  </div>
 );
};

export default MyItems;
