import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
 { label: 'Beranda', href: '/' },
 { label: 'Jelajahi Barang', href: '/items' },
 ];

 const isActive = (href) => location.pathname === href;

 const handleLogout = () => {
 logout();
 navigate('/');
 setIsProfileOpen(false);
 };

 return (
 <header className="sticky top-0 w-full z-50">
 <nav className="bg-surface/80 backdrop-blur-xl w-full border-b border-outline-variant/10 shadow-sm">
 <div className="flex justify-between items-center h-16 px-margin-mobile md:px-gutter max-w-container-max mx-auto">
 
 <div className="flex items-center gap-stack-lg">
 {/* Logo */}
 <Link to="/" className="flex items-center gap-2" aria-label="CampusRent - Beranda">
 <img src="/CampusRent.jpeg" alt="CampusRent Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover" />
 <span className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-extrabold text-primary">
 CampusRent
 </span>
 </Link>

 {/* Desktop Nav Links */}
 <div className="hidden md:flex gap-stack-md">
 {navLinks.map(({ label, href }) => (
 <Link
 key={href}
 to={href}
 className={`font-label-md text-label-md px-3 py-2 rounded-lg transition-colors ${
 isActive(href)
 ? 'text-primary font-bold bg-primary/5 '
 : 'text-on-surface-variant hover:text-primary hover:bg-primary/5 '
 }`}
 >
 {label}
 </Link>
 ))}
 </div>
 </div>

 <div className="flex items-center gap-stack-sm text-on-surface-variant">
 {/* Theme Toggle */}
 <button
 onClick={toggleTheme}
 className="p-2 rounded-full hover:bg-primary/5 hover:text-primary transition-colors group"
 title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
 >
 <span className="material-symbols-outlined text-2xl group-active:scale-95 duration-200">
 {theme === 'dark' ? 'light_mode' : 'dark_mode'}
 </span>
 </button>

 {isAuthenticated ? (
 <>
 {/* Notification */}
 <NotificationsDropdown customClass="p-2 rounded-full hover:bg-primary/5 hover:text-primary transition-colors group" />

 {/* Profile dropdown */}
 <div className="relative" ref={profileRef}>
 <button
 onClick={() => setIsProfileOpen(!isProfileOpen)}
 className="p-2 rounded-full hover:bg-primary/5 hover:text-primary transition-colors group flex items-center gap-2"
 aria-expanded={isProfileOpen}
 >
 {user?.fotoProfil ? (
 <img src={`${UPLOADS_URL}${user.fotoProfil}`} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
 ) : (
 <span className="material-symbols-outlined text-2xl group-active:scale-95 duration-200">
 account_circle
 </span>
 )}
 </button>

 {isProfileOpen && (
 <div className="absolute right-0 mt-2 w-56 rounded-xl py-2 z-50 bg-surface-container-lowest border border-outline-variant/20 shadow-lg">
 <div className="px-4 py-3 border-b border-outline-variant/10">
 <p className="font-label-md text-label-md text-on-surface">{user?.nama}</p>
 <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{user?.email}</p>
 </div>
 
 <div className="py-1 flex flex-col">
 <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container hover:text-primary transition-colors font-label-md text-label-md text-on-surface-variant">
 <span className="material-symbols-outlined text-[18px]">dashboard</span> Dashboard
 </Link>
 {(user?.role === 'ADMIN' || user?.role === 'admin' || user?.role === 'OWNER' || user?.role === 'owner') && (
 <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-primary-container/10 text-primary font-label-md text-label-md transition-colors">
 <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span> Admin Panel
 </Link>
 )}
 <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container hover:text-primary transition-colors font-label-md text-label-md text-on-surface-variant">
 <span className="material-symbols-outlined text-[18px]">person</span> Profil
 </Link>
 <Link to="/chat" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container hover:text-primary transition-colors font-label-md text-label-md text-on-surface-variant">
 <span className="material-symbols-outlined text-[18px]">chat</span> Chat
 </Link>
 <Link to="/transactions" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container hover:text-primary transition-colors font-label-md text-label-md text-on-surface-variant">
 <span className="material-symbols-outlined text-[18px]">receipt_long</span> Transaksi
 </Link>
 <Link to="/wallet" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container hover:text-primary transition-colors font-label-md text-label-md text-on-surface-variant">
 <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span> Dompet
 </Link>
 <Link to="/my-items" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container hover:text-primary transition-colors font-label-md text-label-md text-on-surface-variant">
 <span className="material-symbols-outlined text-[18px]">inventory_2</span> Barang Saya
 </Link>
 <Link to="/wishlist" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-error-container/50 hover:text-error transition-colors font-label-md text-label-md text-on-surface-variant border-b border-outline-variant/10">
 <span className="material-symbols-outlined text-[18px]">favorite</span> Wishlist
 </Link>
 <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 hover:bg-error-container/20 text-error transition-colors font-label-md text-label-md w-full text-left mt-1">
 <span className="material-symbols-outlined text-[18px]">logout</span> Keluar
 </button>
 </div>
 </div>
 )}
 </div>
 </>
 ) : (
 <div className="hidden md:flex gap-2 ml-2">
 <Link to="/login" className="px-4 py-2 rounded-full font-label-md text-label-md text-primary hover:bg-primary/10 transition-colors">
 Masuk
 </Link>
 <Link to="/register" className="px-4 py-2 rounded-full font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 transition-opacity">
 Daftar
 </Link>
 </div>
 )}

 {/* Mobile Menu Toggle */}
 <button
 id="mobile-menu-toggle"
 className="md:hidden p-2 rounded-full hover:bg-primary/5 transition-colors group ml-1"
 onClick={() => setIsMenuOpen(!isMenuOpen)}
 >
 <span className="material-symbols-outlined text-2xl">
 {isMenuOpen ? 'close' : 'menu'}
 </span>
 </button>
 </div>
 </div>

 {/* Mobile Menu */}
 {isMenuOpen && (
 <div ref={mobileMenuRef} className="md:hidden bg-surface-container-lowest border-t border-outline-variant/10 py-4 px-margin-mobile flex flex-col gap-2">
 {navLinks.map(({ label, href }) => (
 <Link
 key={href}
 to={href}
 onClick={() => setIsMenuOpen(false)}
 className={`font-label-md text-label-md px-4 py-3 rounded-lg transition-colors ${
 isActive(href)
 ? 'text-primary bg-primary/10'
 : 'text-on-surface-variant hover:bg-surface-container'
 }`}
 >
 {label}
 </Link>
 ))}
 {!isAuthenticated && (
 <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-outline-variant/10">
 <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center px-4 py-3 rounded-xl font-label-md text-label-md text-primary border border-primary/20 hover:bg-primary/5 transition-colors">
 Masuk
 </Link>
 <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full text-center px-4 py-3 rounded-xl font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 transition-opacity">
 Daftar Sekarang
 </Link>
 </div>
 )}
 </div>
 )}
 </nav>
 </header>
 );
};

export default Navbar;
