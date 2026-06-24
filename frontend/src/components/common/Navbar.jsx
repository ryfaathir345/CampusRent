// src/components/common/Navbar.jsx
// Responsive navbar component

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Menu,
  X,
  User,
  LogOut,
  Home,
  Package,
  Bell,
  ChevronDown,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Moon,
  Sun,
  Heart,
  Wallet,
  Activity
} from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        // We only close mobile menu if the click wasn't on the toggle button itself
        if (!event.target.closest('#mobile-menu-toggle')) {
          setIsMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const navLinks = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Jelajahi Barang', href: '/items', icon: Package },
  ];

  const isActive = (href) => location.pathname === href;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Backdrop blur bar */}
      <nav className="pt-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-blue-600/10 dark:border-white/10 shadow-[0_2px_20px_rgba(37,99,235,0.06)] dark:shadow-none">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group" aria-label="CampusRent - Beranda">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden shadow-sm">
                <img src="/CampusRent.jpeg" alt="CampusRent Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors">
                  Campus<span className="text-blue-600">Rent</span>
                </span>
                <span className="text-xs text-gray-400 font-medium hidden sm:block">
                  Platform Peminjaman Mahasiswa
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(href)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notification dropdown */}
                  <NotificationsDropdown />

                  {/* Profile dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                      aria-expanded={isProfileOpen}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                      >
                        {user?.fotoProfil ? (
                          <img src={`${UPLOADS_URL}${user.fotoProfil}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          user?.nama?.[0]?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-tight">
                          {user?.nama?.split(' ')[0]}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-400">{user?.nim || 'Mahasiswa'}</p>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 dark:text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Dropdown */}
                    {isProfileOpen && (
                      <div
                        className="absolute right-0 mt-2 w-52 rounded-2xl py-2 z-50 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xl"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{user?.nama}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LayoutDashboard size={15} /> Dashboard
                        </Link>
                        {(user?.role === 'ADMIN' || user?.role === 'admin') && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings size={15} /> Admin Panel
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User size={15} /> Profil
                        </Link>
                        <Link
                          to="/chat"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <MessageCircle size={15} /> Chat
                        </Link>
                        <Link
                          to="/transactions"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <BookOpen size={15} /> Transaksi
                        </Link>
                        <Link
                          to="/wallet"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-t border-gray-100 dark:border-slate-700"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Wallet size={15} /> Dompet Saya
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-700 hover:text-red-500 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Heart size={15} /> Wishlist
                        </Link>
                        <Link
                          to="/my-items"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Package size={15} /> Barang Saya
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User size={15} /> Profil Saya
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <LogOut size={15} /> Keluar
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary py-2 px-5 text-sm">
                    Masuk
                  </Link>
                  <Link to="/register" className="btn-primary py-2 px-5 text-sm">
                    Daftar
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                id="mobile-menu-toggle"
                className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu'}
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden"
            style={{
              borderTop: '1px solid rgba(37, 99, 235, 0.1)',
              background: 'rgba(255, 255, 255, 0.98)',
            }}
          >
            <div className="page-container py-4 flex flex-col gap-1">
              {navLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(href)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={17} /> {label}
                </Link>
              ))}

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-slate-800 rounded-xl mb-2">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold shadow-sm overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                      >
                        {user?.fotoProfil ? (
                          <img src={`${UPLOADS_URL}${user.fotoProfil}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          user?.nama?.[0]?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{user?.nama}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{user?.email}</p>
                      </div>
                    </div>
                    
                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-purple-700 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 rounded-xl transition-colors mb-2"
                      >
                        <Settings size={16} /> Admin Panel
                      </Link>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <User size={16} /> Profil Saya
                      </Link>
                      <Link
                        to="/transactions"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <BookOpen size={16} /> Transaksi
                      </Link>
                      <Link
                        to="/wallet"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Wallet size={16} /> Dompet Saya
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-800 hover:text-red-500 transition-colors"
                      >
                        <Heart size={16} /> Wishlist
                      </Link>
                      <Link
                        to="/my-items"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Package size={16} /> Barang Saya
                      </Link>
                    </div>
                    
                    <Link
                      to="/chat"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors mb-2"
                    >
                      <MessageCircle size={16} /> Chat
                    </Link>

                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors mt-2"
                    >
                      <LogOut size={16} /> Keluar
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      to="/login"
                      className="btn-secondary w-full justify-center py-2.5"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Masuk
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary w-full justify-center py-2.5"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Daftar Sekarang
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
