// src/context/AuthContext.jsx
// Global authentication context — session persistence via localStorage

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

const TOKEN_KEY = 'kp_token';
const USER_KEY = 'kp_user';

export const AuthProvider = ({ children }) => {
 // Inisialisasi dari localStorage agar tidak flash saat reload
 const [user, setUser] = useState(() => {
 try {
 const stored = localStorage.getItem(USER_KEY);
 return stored ? JSON.parse(stored) : null;
 } catch {
 return null;
 }
 });

 const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
 const [isLoading, setIsLoading] = useState(true);

 // ─── Verifikasi token ke server saat app load ───────
 const verifyToken = useCallback(async () => {
 const savedToken = localStorage.getItem(TOKEN_KEY);

 if (!savedToken) {
 setIsLoading(false);
 return;
 }

 try {
 const res = await authService.getMe();
 setUser(res.data);
 setToken(savedToken);
 // Simpan ulang user terbaru
 localStorage.setItem(USER_KEY, JSON.stringify(res.data));
 } catch {
 // Token expired / invalid — clear semua
 localStorage.removeItem(TOKEN_KEY);
 localStorage.removeItem(USER_KEY);
 setToken(null);
 setUser(null);
 } finally {
 setIsLoading(false);
 }
 }, []);

 useEffect(() => {
 verifyToken();
 }, [verifyToken]);

 // ─── Login ────────────────────────────────────────
 const login = (userData, authToken) => {
 localStorage.setItem(TOKEN_KEY, authToken);
 localStorage.setItem(USER_KEY, JSON.stringify(userData));
 setToken(authToken);
 setUser(userData);
 };

 // ─── Logout ───────────────────────────────────────
 const logout = async () => {
 await authService.logout(); // notify server
 localStorage.removeItem(TOKEN_KEY);
 localStorage.removeItem(USER_KEY);
 setToken(null);
 setUser(null);
 };

 // ─── Update user di context setelah edit profil ───
 const updateUser = (updatedUser) => {
 const merged = { ...user, ...updatedUser };
 setUser(merged);
 localStorage.setItem(USER_KEY, JSON.stringify(merged));
 };

 const isAuthenticated = !!user && !!token;
 const isAdmin = user?.role === 'ADMIN';
 const isMahasiswa = user?.role === 'MAHASISWA';

 return (
 <AuthContext.Provider
 value={{
 user,
 token,
 isLoading,
 isAuthenticated,
 isAdmin,
 isMahasiswa,
 login,
 logout,
 updateUser,
 verifyToken,
 }}
 >
 {children}
 </AuthContext.Provider>
 );
};

// Custom hook
export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) {
 throw new Error('useAuth harus digunakan di dalam AuthProvider');
 }
 return context;
};

export default AuthContext;
