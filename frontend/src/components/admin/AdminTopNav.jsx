import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminTopNav = ({ toggleTheme }) => {
  const { user } = useAuth();
  
  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 h-16 glass-panel border-b border-outline-variant/20 flex items-center justify-between px-gutter">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-label-md focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface" placeholder="Cari sesuatu..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="hover:bg-surface-container-low rounded-full p-2 transition-all" onClick={toggleTheme}>
          <span className="material-symbols-outlined text-on-surface-variant">dark_mode</span>
        </button>
        <button className="hover:bg-surface-container-low rounded-full p-2 transition-all relative">
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <div className="h-8 w-[1px] bg-outline-variant/30 mx-2"></div>
        <Link to="/admin/profile" className="flex items-center gap-3 pl-2 hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-label-sm font-bold text-on-surface">{user?.nama || user?.name || 'Admin'}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{user?.role === 'OWNER' ? 'Owner' : 'Admin'}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
            {user?.fotoProfil ? (
              <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${user.fotoProfil}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-2xl">account_circle</span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default AdminTopNav;
