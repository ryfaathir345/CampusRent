import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';

const Login = () => {
 const [form, setForm] = useState({ email: '', password: '' });
 const [showPassword, setShowPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [errors, setErrors] = useState({});

 const { login } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();

 const from = location.state?.from?.pathname || '/';

 const validate = () => {
 const e = {};
 if (!form.email) {
 e.email = 'Email wajib diisi';
 } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
 e.email = 'Format email tidak valid';
 }
 if (!form.password) e.password = 'Password wajib diisi';
 setErrors(e);
 return Object.keys(e).length === 0;
 };

 const handleChange = (e) => {
 const { name, value } = e.target;
 setForm((prev) => ({ ...prev, [name]: value }));
 if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!validate()) return;

 setIsLoading(true);
 try {
 const res = await authService.login(form);
 login(res.data.user, res.data.token);
 toast.success(res.message || 'Login berhasil!');
 navigate(from, { replace: true });
 } catch (err) {
 const serverErrors = err.response?.data?.errors;
 if (serverErrors && typeof serverErrors === 'object') {
 setErrors(serverErrors);
 } else {
 toast.error(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
 }
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="bg-background text-on-background min-h-screen font-body-md antialiased overflow-x-hidden flex items-center justify-center p-4">
 <main className="w-full max-w-container-max flex flex-col lg:flex-row min-h-[800px] rounded-[2rem] overflow-hidden shadow-2xl relative bg-surface">
 
 {/* Background Pattern */}
 <div className="absolute inset-0 opacity-5 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
 
 {/* Left Column: Branding */}
 <div className="hidden lg:flex w-full lg:w-5/12 bg-gradient-to-br from-primary-fixed-variant to-primary flex-col justify-between p-12 text-on-primary relative z-10">
 <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
 <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-container rounded-full blur-3xl opacity-30 mix-blend-screen"></div>
 <div className="absolute bottom-10 right-10 w-96 h-96 bg-surface-tint rounded-full blur-[100px] opacity-40 mix-blend-screen"></div>
 </div>
 <div>
 <Link to="/" className="inline-flex items-center gap-2 mb-16">
 <span className="material-symbols-outlined text-4xl text-on-primary">sync_alt</span>
 <span className="font-headline-lg text-headline-lg font-black tracking-tight">CampusRent</span>
 </Link>
 <h1 className="font-display-lg text-display-lg text-on-primary mb-6">Selamat datang kembali!</h1>
 <p className="font-body-lg text-body-lg text-primary-fixed-dim mb-12 opacity-90 max-w-md">Lanjutkan perjalanan Anda di ekosistem peminjaman barang antar mahasiswa yang aman dan terpercaya.</p>
 <ul className="space-y-6">
 <li className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-full bg-on-primary/10 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/10">
 <span className="material-symbols-outlined text-on-primary">verified_user</span>
 </div>
 <div>
 <h3 className="font-title-md text-title-md text-on-primary mb-1">Keamanan Terjamin</h3>
 <p className="font-body-md text-body-md text-primary-fixed-dim">Verifikasi mahasiswa memastikan komunitas yang aman.</p>
 </div>
 </li>
 <li className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-full bg-on-primary/10 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/10">
 <span className="material-symbols-outlined text-on-primary">local_mall</span>
 </div>
 <div>
 <h3 className="font-title-md text-title-md text-on-primary mb-1">Beragam Pilihan</h3>
 <p className="font-body-md text-body-md text-primary-fixed-dim">Dari buku hingga alat praktikum, semua ada di sini.</p>
 </div>
 </li>
 </ul>
 </div>
 <div className="mt-12 text-sm text-primary-fixed-dim font-label-sm text-label-sm">
 © 2026 CampusRent. Made with ❤️ for students.
 </div>
 </div>

 {/* Right Column: Forms */}
 <div className="w-full lg:w-7/12 p-6 md:p-12 lg:p-16 flex items-center justify-center relative z-10">
 <div className="lg:hidden absolute top-8 left-8">
 <Link to="/" className="inline-flex items-center gap-2">
 <span className="material-symbols-outlined text-primary">sync_alt</span>
 <span className="font-title-md text-title-md font-bold text-primary">CampusRent</span>
 </Link>
 </div>

 <div className="w-full max-w-md animate-fade-in transition-all duration-500">
 <div className="mb-10 text-center lg:text-left mt-16 lg:mt-0">
 <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Masuk ke Akun</h2>
 <p className="font-body-md text-body-md text-on-surface-variant">Masukkan kredensial Anda untuk mengakses dashboard.</p>
 </div>
 
 <form onSubmit={handleSubmit} className="space-y-6" noValidate>
 <div>
 <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="email">Email Kampus</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <span className="material-symbols-outlined text-outline" style={{ color: errors.email ? 'var(--color-error)' : undefined }}>mail</span>
 </div>
 <input 
 className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
 id="email" 
 name="email"
 placeholder="nim@mahasiswa.univ.edu" 
 required 
 type="email"
 value={form.email}
 onChange={handleChange}
 style={{ borderColor: errors.email ? 'var(--color-error)' : undefined }}
 />
 </div>
 {errors.email && <p className="text-xs text-error mt-1.5 font-medium">{errors.email}</p>}
 </div>

 <div>
 <div className="flex justify-between items-center mb-2">
 <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
 <Link to="/forgot-password" className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors">Lupa password?</Link>
 </div>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <span className="material-symbols-outlined text-outline" style={{ color: errors.password ? 'var(--color-error)' : undefined }}>lock</span>
 </div>
 <input 
 className="w-full pl-12 pr-12 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
 id="password" 
 name="password"
 placeholder="••••••••" 
 required 
 type={showPassword ?"text" :"password"}
 value={form.password}
 onChange={handleChange}
 style={{ borderColor: errors.password ? 'var(--color-error)' : undefined }}
 />
 <button 
 className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface transition-colors" 
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 >
 <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
 </button>
 </div>
 {errors.password && <p className="text-xs text-error mt-1.5 font-medium">{errors.password}</p>}
 </div>

 <button 
 disabled={isLoading}
 className="w-full py-4 bg-primary text-on-primary font-title-md text-title-md rounded-xl hover:bg-primary-container transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed" 
 type="submit"
 >
 {isLoading ? (
 <>
 <span className="material-symbols-outlined animate-spin">refresh</span>
 Sedang masuk...
 </>
 ) : (
 <>
 Masuk 
 <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
 </>
 )}
 </button>
 </form>

 <div className="mt-8 text-center">
 <p className="font-body-md text-body-md text-on-surface-variant">
 Belum punya akun? 
 <Link to="/register" className="font-title-md text-title-md text-primary hover:underline underline-offset-4 ml-1 focus:outline-none">Buat Akun Baru</Link>
 </p>
 </div>
 
 <p className="text-center text-xs text-outline mt-8 flex items-center justify-center gap-1.5">
 <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
 Informasi kamu dilindungi dengan enkripsi JWT & bcrypt
 </p>
 </div>

 </div>
 </main>
 </div>
 );
};

export default Login;
