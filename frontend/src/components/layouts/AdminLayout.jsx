// src/components/layouts/AdminLayout.jsx
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/admin', icon: 'dashboard', label: 'Overview' },
    { path: '/admin/users', icon: 'group', label: 'Users' },
    { path: '/admin/ktm', icon: 'fact_check', label: 'KTM Verification' },
    { path: '/admin/finance', icon: 'payments', label: 'Finance' },
    { path: '/admin/items', icon: 'inventory_2', label: 'Items Moderation' },
    { path: '/admin/transactions', icon: 'receipt_long', label: 'Transactions' },
    { path: '/admin/categories', icon: 'category', label: 'Categories' },
    { path: '/admin/reports', icon: 'analytics', label: 'Reports' },
  ];

  return (
    <div className="bg-surface text-on-surface flex overflow-hidden font-body-md h-screen">
      {/* SideNavBar (Fixed) */}
      <aside className="w-[280px] h-screen fixed left-0 top-0 bg-[#0f172a] flex flex-col py-stack-lg z-50 shadow-xl border-r border-slate-800">
        <div className="px-gutter mb-10">
          <h1 className="font-headline-md text-headline-md font-bold text-white tracking-tight">CampusRent</h1>
          <p className="font-body-md text-body-md text-slate-400">Admin Console</p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar px-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
            return (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${
                  isActive 
                    ? 'sidebar-active' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className="material-symbols-outlined mr-3">{link.icon}</span>
                <span className="font-body-md text-body-md">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mt-auto pt-6 border-t border-slate-800 space-y-1">
          <Link to="/" className="text-slate-400 hover:text-white flex items-center px-4 py-2 text-sm transition-colors rounded-lg hover:bg-slate-800/50">
            <span className="material-symbols-outlined mr-3 text-[20px]">public</span>
            Back to App
          </Link>
          <button onClick={handleLogout} className="w-full text-left text-slate-400 hover:text-white flex items-center px-4 py-2 text-sm transition-colors rounded-lg hover:bg-slate-800/50">
            <span className="material-symbols-outlined mr-3 text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area Wrapper */}
      <div className="flex-1 ml-[280px] min-h-screen flex flex-col">
        {/* TopNavBar */}
        <header className="h-[72px] sticky top-0 z-40 bg-surface border-b border-outline-variant flex justify-between items-center px-gutter w-full">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                type="text" 
                placeholder="Search students, items, or transactions..." 
                className="w-full bg-surface-container-lowest border border-outline rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-body-md"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors relative">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
            </button>
            
            <div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="font-label-md text-label-md text-on-surface leading-tight">{user?.nama}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold">
                {user?.nama ? user.nama.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-gutter flex-1 bg-surface-container-lowest overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
