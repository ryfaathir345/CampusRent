import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', icon: 'dashboard', label: 'Overview', end: true },
    { to: '/admin/users', icon: 'group', label: 'Pengguna' },
    { to: '/admin/ktm', icon: 'id_card', label: 'Verifikasi KTM' },
    { to: '/admin/finance', icon: 'payments', label: 'Keuangan' },
    { to: '/admin/items', icon: 'inventory_2', label: 'Moderasi Barang' },
    { to: '/admin/transactions', icon: 'receipt_long', label: 'Transaksi' },
    { to: '/admin/categories', icon: 'category', label: 'Kategori' },
    { to: '/admin/promos', icon: 'loyalty', label: 'Promosi' },
    { to: '/admin/reports', icon: 'report', label: 'Laporan' },
    { to: '/admin/profile', icon: 'person', label: 'Profil Saya' }
  ];

  const getNavLinkClass = ({ isActive }) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition-all ";
    if (isActive) {
      return baseClass + "bg-primary-container/20 text-primary font-bold shadow-[0_0_15px_rgba(0,74,198,0.1)]";
    }
    return baseClass + "text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface";
  };

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/20 bg-surface/80 backdrop-blur-xl flex-col p-4 z-50">
      <div className="mb-stack-xl px-2 flex items-center gap-3">
        <img src="/CampusRent.jpeg" alt="CampusRent Logo" className="w-10 h-10 object-cover rounded-md" />
        <div>
          <h1 className="font-title-md text-title-md text-primary tracking-tight">CampusRent Admin</h1>
          <p className="text-label-sm text-on-surface-variant/70">{user?.role === 'OWNER' ? 'System Owner' : 'System Administrator'}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={getNavLinkClass}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-label-md">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 flex flex-col gap-2">
        <div className="p-4 bg-primary-container/10 rounded-xl border border-primary-container/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4edea3] animate-pulse"></div>
            <span className="text-label-sm font-bold text-primary">System Status</span>
          </div>
          <p className="text-[10px] text-on-surface-variant leading-tight">All clusters operational. Next sync in 4m.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-error/10 text-error rounded-xl font-label-md hover:bg-error/20 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
