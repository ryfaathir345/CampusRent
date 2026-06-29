import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeTab }) => {
 const { user } = useAuth();
 
 // In Profile.jsx, user reputation might be fetched, but we'll use a basic default for now or pass it down.
 // For simplicity, we just check user properties.
 const isVerified = user?.ktmVerified;

 return (
 <aside className="hidden md:flex flex-col gap-stack-sm p-stack-md w-64 bg-surface-container-low/80 backdrop-blur-xl border border-white/10 shadow-md rounded-xl h-fit sticky top-24 shrink-0 z-40 transition-all duration-300">
 {/* Header */}
 <div className="flex items-center gap-3 mb-4 pb-4 border-b border-outline-variant/20">
 <div className="w-12 h-12 rounded-full bg-surface-variant overflow-hidden shrink-0 border-2 border-primary-container">
 <img 
 src={user?.fotoProfil ||"https://lh3.googleusercontent.com/aida-public/AB6AXuD1GuTE72HjrH95gjoDfkdoqaz3uPJllF0g2fYuqpJ04CYBt4ZxE5kAmmUEpFVQrWGf7hOxba371WjbwyGsqVNC2CcO3G6L6E4_B-bRsWb1k4dZCVD0nJvE5DrOdD90pZuAhUl5W0DC9f3oHKSp6Yh6m3ifVV8ZD-ZWKijuGdI2vy2b-7ySrwuNGpppEPhzVbcLhFC-TqKRWe089qOZqCF3x3vOz-N2xb-pntssKAvDTxn0GRJvuu1PDg"} 
 alt="User Profile Picture" 
 className="w-full h-full object-cover" 
 />
 </div>
 <div>
 <h2 className="font-title-md text-title-md text-primary line-clamp-1">Akun Saya</h2>
 {isVerified && (
 <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
 <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
 Mahasiswa Terverifikasi
 </p>
 )}
 </div>
 </div>

 {/* Navigation Tabs */}
 <nav className="flex flex-col gap-1">
 <Link 
 to="/profile" 
 className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all ${activeTab === 'profile' ? 'bg-primary-container text-on-primary-container font-bold scale-98 duration-150' : 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1'}`}
 >
 <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'profile' ?"'FILL' 1" :"'FILL' 0"}}>person</span>
 <span>Profil Saya</span>
 </Link>
 
 <Link 
 to="/transactions" 
 className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all ${activeTab === 'transactions' ? 'bg-primary-container text-on-primary-container font-bold scale-98 duration-150' : 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1'}`}
 >
 <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'transactions' ?"'FILL' 1" :"'FILL' 0"}}>history</span>
 <span>Riwayat Peminjaman</span>
 </Link>
 
 <Link 
 to="/chat" 
 className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all ${activeTab === 'chat' ? 'bg-primary-container text-on-primary-container font-bold scale-98 duration-150' : 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1'}`}
 >
 <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'chat' ?"'FILL' 1" :"'FILL' 0"}}>chat</span>
 <span>Pesan</span>
 </Link>
 
 <Link 
 to="/wallet" 
 className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all ${activeTab === 'wallet' ? 'bg-primary-container text-on-primary-container font-bold scale-98 duration-150' : 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1'}`}
 >
 <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'wallet' ?"'FILL' 1" :"'FILL' 0"}}>account_balance_wallet</span>
 <span>Dompet</span>
 </Link>
 
 {/* 
 <Link 
 to="/settings" 
 className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all ${activeTab === 'settings' ? 'bg-primary-container text-on-primary-container font-bold scale-98 duration-150' : 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1'}`}
 >
 <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'settings' ?"'FILL' 1" :"'FILL' 0"}}>settings</span>
 <span>Pengaturan</span>
 </Link> 
 */}
 </nav>
 </aside>
 );
};

export default Sidebar;
