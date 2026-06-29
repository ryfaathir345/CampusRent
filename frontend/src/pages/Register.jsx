import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';
import CustomSelect from '../components/common/CustomSelect';

const JURUSAN_LIST = [
 'Teknik Informatika',
 'Sistem Informasi',
 'Teknik Elektro',
 'Teknik Mesin',
 'Teknik Sipil',
 'Teknik Kimia',
 'Teknik Industri',
 'Teknik Lingkungan',
 'Ilmu Komputer',
 'Teknologi Informasi',
 'Matematika',
 'Fisika',
 'Kimia',
 'Biologi',
 'Manajemen',
 'Akuntansi',
 'Ekonomi Pembangunan',
 'Bisnis Digital',
 'Ilmu Komunikasi',
 'Hubungan Internasional',
 'Ilmu Hukum',
 'Administrasi Bisnis',
 'Kedokteran',
 'Keperawatan',
 'Farmasi',
 'Kesehatan Masyarakat',
 'Desain Komunikasi Visual',
 'Arsitektur',
 'Desain Interior',
 'Pendidikan Matematika',
 'Pendidikan Bahasa Indonesia',
 'Pendidikan Bahasa Inggris',
 'PGSD',
 'Lainnya',
];

const getPasswordStrength = (pass) => {
 if (!pass) return { level: 0, color: 'var(--color-outline-variant)' };
 let score = 0;
 if (pass.length >= 8) score++;
 if (/[A-Z]/.test(pass)) score++;
 if (/[0-9]/.test(pass)) score++;
 if (/[^A-Za-z0-9]/.test(pass)) score++;
 
 if (score === 1) return { level: 1, color: 'var(--color-error)' };
 if (score === 2) return { level: 2, color: 'var(--color-tertiary)' };
 if (score >= 3) return { level: 3, color: 'var(--color-primary)' };
 return { level: 0, color: 'var(--color-outline-variant)' };
};

const Register = () => {
 const [form, setForm] = useState({
 nama: '',
 email: '',
 nim: '',
 jurusan: '',
 universitas: '',
 whatsapp: '',
 password: '',
 confirmPassword: '',
 });

 const [showPassword, setShowPassword] = useState(false);
 const [showConfirm, setShowConfirm] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [errors, setErrors] = useState({});
 const [agreed, setAgreed] = useState(false);

 const { login } = useAuth();
 const navigate = useNavigate();
 const pwStrength = getPasswordStrength(form.password);

 const validate = () => {
 const e = {};
 if (!form.nama.trim() || form.nama.trim().length < 3) e.nama = 'Minimal 3 karakter';
 if (!form.email) e.email = 'Wajib diisi';
 else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email tidak valid';
 else if (!form.email.toLowerCase().trim().endsWith('.ac.id')) e.email = 'Gunakan email .ac.id';
 
 if (!form.password) e.password = 'Wajib diisi';
 else if (form.password.length < 8) e.password = 'Minimal 8 karakter';
 
 if (!form.confirmPassword) e.confirmPassword = 'Wajib diisi';
 else if (form.password !== form.confirmPassword) e.confirmPassword = 'Tidak cocok';
 
 if (form.nim && !/^\d{5,20}$/.test(form.nim.trim())) e.nim = 'Angka (5-20 digit)';
 if (form.whatsapp && !/^(\+62|08)\d{7,13}$/.test(form.whatsapp.trim())) e.whatsapp = 'Format salah';
 
 if (!agreed) e.terms = 'Anda harus menyetujui S&K';

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
 const { confirmPassword, ...payload } = form;
 const res = await authService.register(payload);
 login(res.data.user, res.data.token);
 toast.success(res.message || 'Registrasi berhasil! 🎉');
 navigate('/');
 } catch (err) {
 const serverErrors = err.response?.data?.errors;
 if (serverErrors && typeof serverErrors === 'object') {
 setErrors(serverErrors);
 toast.error('Periksa kembali data Anda.');
 } else {
 toast.error(err.response?.data?.message || 'Terjadi kesalahan.');
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
 <h1 className="font-display-lg text-display-lg text-on-primary mb-6">Mulai Perjalanan Anda</h1>
 <p className="font-body-lg text-body-lg text-primary-fixed-dim mb-12 opacity-90 max-w-md">Daftarkan diri Anda dan bergabung dalam komunitas peminjaman barang mahasiswa yang inovatif.</p>
 <ul className="space-y-6">
 <li className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-full bg-on-primary/10 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/10">
 <span className="material-symbols-outlined text-on-primary">school</span>
 </div>
 <div>
 <h3 className="font-title-md text-title-md text-on-primary mb-1">Khusus Mahasiswa</h3>
 <p className="font-body-md text-body-md text-primary-fixed-dim">Validasi email .ac.id untuk keamanan ekstra.</p>
 </div>
 </li>
 <li className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-full bg-on-primary/10 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/10">
 <span className="material-symbols-outlined text-on-primary">volunteer_activism</span>
 </div>
 <div>
 <h3 className="font-title-md text-title-md text-on-primary mb-1">Saling Membantu</h3>
 <p className="font-body-md text-body-md text-primary-fixed-dim">Temukan barang yang Anda butuhkan dengan mudah.</p>
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

 <div className="w-full max-w-lg animate-fade-in transition-all duration-500">
 <div className="mb-8 text-center lg:text-left mt-12 lg:mt-0">
 <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Daftar Sekarang</h2>
 <p className="font-body-md text-body-md text-on-surface-variant">Bergabunglah dengan komunitas peminjaman barang mahasiswa.</p>
 </div>
 
 <form onSubmit={handleSubmit} className="space-y-5 h-[614px] lg:h-auto overflow-y-auto pr-2 no-scrollbar" noValidate>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="nama">Nama Lengkap</label>
 <input 
 className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
 id="nama" 
 name="nama"
 placeholder="John Doe" 
 type="text"
 value={form.nama}
 onChange={handleChange}
 style={{ borderColor: errors.nama ? 'var(--color-error)' : undefined }}
 />
 {errors.nama && <p className="text-xs text-error mt-1 font-medium">{errors.nama}</p>}
 </div>
 <div>
 <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="nim">NIM</label>
 <input 
 className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
 id="nim" 
 name="nim"
 placeholder="123456789" 
 type="text"
 value={form.nim}
 onChange={handleChange}
 style={{ borderColor: errors.nim ? 'var(--color-error)' : undefined }}
 />
 {errors.nim && <p className="text-xs text-error mt-1 font-medium">{errors.nim}</p>}
 </div>
 </div>

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
 type="email"
 value={form.email}
 onChange={handleChange}
 style={{ borderColor: errors.email ? 'var(--color-error)' : undefined }}
 />
 </div>
 {errors.email && <p className="text-xs text-error mt-1.5 font-medium">{errors.email}</p>}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="universitas">Universitas</label>
 <input 
 className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
 id="universitas" 
 name="universitas"
 placeholder="Nama Universitas" 
 type="text"
 value={form.universitas}
 onChange={handleChange}
 style={{ borderColor: errors.universitas ? 'var(--color-error)' : undefined }}
 />
 {errors.universitas && <p className="text-xs text-error mt-1 font-medium">{errors.universitas}</p>}
 </div>
 <div>
 <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="jurusan">Jurusan</label>
 <CustomSelect 
 className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-1 py-1.5 font-body-md text-body-md shadow-sm transition-all focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary"
 value={form.jurusan}
 onChange={(val) => {
 setForm((prev) => ({ ...prev, jurusan: val }));
 if (errors.jurusan) setErrors((prev) => ({ ...prev, jurusan: '' }));
 }}
 options={JURUSAN_LIST.map((j) => ({ value: j, label: j }))}
 placeholder="Pilih Jurusan"
 />
 {errors.jurusan && <p className="text-xs text-error mt-1 font-medium">{errors.jurusan}</p>}
 </div>
 </div>

 <div>
 <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="whatsapp">Nomor WhatsApp</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <span className="font-label-md text-label-md text-outline" style={{ color: errors.whatsapp ? 'var(--color-error)' : undefined }}>+62</span>
 </div>
 <input 
 className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
 id="whatsapp" 
 name="whatsapp"
 placeholder="81234567890" 
 type="tel"
 value={form.whatsapp}
 onChange={handleChange}
 style={{ borderColor: errors.whatsapp ? 'var(--color-error)' : undefined }}
 />
 </div>
 {errors.whatsapp && <p className="text-xs text-error mt-1.5 font-medium">{errors.whatsapp}</p>}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="password">Password</label>
 <div className="relative">
 <input 
 className="w-full px-4 pr-10 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
 id="password" 
 name="password"
 placeholder="Minimal 8 karakter" 
 type={showPassword ?"text" :"password"}
 value={form.password}
 onChange={handleChange}
 style={{ borderColor: errors.password ? 'var(--color-error)' : undefined }}
 />
 <button 
 className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors" 
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 >
 <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
 </button>
 </div>
 
 {form.password && (
 <div className="mt-2 flex gap-1 h-1">
 {[1, 2, 3].map((lvl) => (
 <div key={lvl} className="flex-1 rounded-full transition-colors" style={{ backgroundColor: lvl <= pwStrength.level ? pwStrength.color : 'rgba(115, 118, 134, 0.2)' }}></div>
 ))}
 </div>
 )}
 {errors.password && <p className="text-xs text-error mt-1 font-medium">{errors.password}</p>}
 </div>
 <div>
 <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="confirmPassword">Konfirmasi Password</label>
 <div className="relative">
 <input 
 className="w-full px-4 pr-10 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
 id="confirmPassword" 
 name="confirmPassword"
 placeholder="Ulangi password" 
 type={showConfirm ?"text" :"password"}
 value={form.confirmPassword}
 onChange={handleChange}
 style={{ borderColor: errors.confirmPassword ? 'var(--color-error)' : undefined }}
 />
 <button 
 className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors" 
 type="button"
 onClick={() => setShowConfirm(!showConfirm)}
 >
 <span className="material-symbols-outlined text-[20px]">{showConfirm ? 'visibility' : 'visibility_off'}</span>
 </button>
 </div>
 {errors.confirmPassword && <p className="text-xs text-error mt-1 font-medium">{errors.confirmPassword}</p>}
 </div>
 </div>

 <div className="flex items-start gap-3 mt-4">
 <input 
 className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-2 bg-surface cursor-pointer" 
 id="reg-terms" 
 type="checkbox"
 checked={agreed}
 onChange={(e) => {
 setAgreed(e.target.checked);
 if (errors.terms) setErrors(p => ({ ...p, terms: '' }));
 }}
 />
 <div className="flex flex-col">
 <label className="font-body-md text-body-md text-on-surface-variant text-sm cursor-pointer" htmlFor="reg-terms">
 Saya menyetujui <a className="text-primary hover:underline" href="#">Syarat & Ketentuan</a> serta <a className="text-primary hover:underline" href="#">Kebijakan Privasi</a> CampusRent.
 </label>
 {errors.terms && <p className="text-xs text-error mt-1 font-medium">{errors.terms}</p>}
 </div>
 </div>

 <button 
 disabled={isLoading}
 className="w-full py-4 mt-6 bg-primary text-on-primary font-title-md text-title-md rounded-xl hover:bg-primary-container transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed" 
 type="submit"
 >
 {isLoading ? (
 <>
 <span className="material-symbols-outlined animate-spin">refresh</span>
 Mendaftarkan...
 </>
 ) : (
 <>
 Daftar Sekarang 
 <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
 </>
 )}
 </button>
 </form>
 
 <div className="mt-6 text-center">
 <p className="font-body-md text-body-md text-on-surface-variant">
 Sudah punya akun? 
 <Link to="/login" className="font-title-md text-title-md text-primary hover:underline underline-offset-4 ml-1 focus:outline-none">Masuk di sini</Link>
 </p>
 </div>
 
 </div>
 </div>
 </main>
 </div>
 );
};

export default Register;
