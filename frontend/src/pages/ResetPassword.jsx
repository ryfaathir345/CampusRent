import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/auth.service';

const getPasswordStrength = (pass) => {
 if (!pass) return { level: 0, label: '', color: '#e5e7eb' };
 let score = 0;
 if (pass.length >= 8) score++;
 if (/[A-Z]/.test(pass)) score++;
 if (/[0-9]/.test(pass)) score++;
 if (/[^A-Za-z0-9]/.test(pass)) score++;
 const map = [
 { level: 1, label: 'Lemah', color: '#ef4444' },
 { level: 2, label: 'Cukup', color: '#f59e0b' },
 { level: 3, label: 'Kuat', color: '#3b82f6' },
 { level: 4, label: 'Sangat Kuat', color: '#10b981' },
 ];
 return map[score - 1] || { level: 0, label: '', color: '#e5e7eb' };
};

const ResetPassword = () => {
 const { token } = useParams();
 const navigate = useNavigate();

 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirm, setShowConfirm] = useState(false);
 const [isLoading, setIsLoading] = useState(false);

 const pwStrength = getPasswordStrength(password);

 const handleSubmit = async (e) => {
 e.preventDefault();

 if (!password) {
 toast.error('Masukkan kata sandi baru Anda.');
 return;
 }
 
 if (password.length < 8) {
 toast.error('Kata sandi harus minimal 8 karakter.');
 return;
 }

 if (password !== confirmPassword) {
 toast.error('Konfirmasi kata sandi tidak cocok.');
 return;
 }

 setIsLoading(true);
 try {
 const res = await authService.resetPassword({ token, newPassword: password });
 toast.success(res.message || 'Kata sandi berhasil diubah! Silakan login.');
 navigate('/login');
 } catch (err) {
 toast.error(err.response?.data?.message || 'Token tidak valid atau sudah kedaluwarsa.');
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="flex items-center justify-center p-margin-mobile text-on-surface min-h-screen bg-[linear-gradient(135deg,#00174b_0%,#003ea8_100%)] relative overflow-hidden">
 
 {/* Background Decorative Elements */}
 <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-fixed-dim rounded-full mix-blend-multiply filter blur-[64px] opacity-30 animate-blob"></div>
 <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-secondary-fixed-dim rounded-full mix-blend-multiply filter blur-[64px] opacity-30 animate-blob animation-delay-2000"></div>

 <div className="w-full max-w-md relative z-10">
 <div className="bg-inverse-surface/80 [#213145]/80 backdrop-blur-[24px] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] rounded-xl p-stack-lg w-full transition-opacity duration-300">
 
 <div className="flex flex-col items-center mb-stack-lg">
 <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-stack-sm border border-primary/20">
 <span className="material-symbols-outlined text-primary-fixed-dim text-[32px]" style={{fontVariationSettings:"'FILL' 1"}}>
 lock_reset
 </span>
 </div>
 <h1 className="font-headline-lg-mobile md:font-headline-lg text-[24px] md:text-[32px] text-primary-fixed-dim mb-stack-xs text-center font-bold">Atur Password Baru</h1>
 <p className="font-body-md text-[14px] text-surface-variant text-center">
 Silakan masukkan password baru Anda. Pastikan password kuat dan mudah diingat.
 </p>
 </div>

 <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
 <div className="flex flex-col gap-stack-xs">
 <label htmlFor="new-password" className="font-label-md text-[14px] text-surface-variant font-medium">Password Baru</label>
 <div className="relative">
 <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-[20px]">
 lock
 </span>
 <input
 id="new-password"
 type={showPassword ? 'text' : 'password'}
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full bg-black/20 border border-outline-variant/30 rounded-lg py-3 pl-10 pr-10 text-white font-body-md text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant/50"
 placeholder="••••••••"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-surface-variant transition-colors p-1"
 >
 <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
 </button>
 </div>
 {/* Password strength bar */}
 {password && (
 <div className="mt-2 px-1">
 <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-black/20">
 {[1, 2, 3, 4].map((lvl) => (
 <div
 key={lvl}
 className="h-full flex-1 transition-all duration-300"
 style={{ background: lvl <= pwStrength.level ? pwStrength.color : 'transparent' }}
 />
 ))}
 </div>
 <p className="text-[10px] mt-1 font-medium text-right" style={{ color: pwStrength.color }}>
 {pwStrength.label}
 </p>
 </div>
 )}
 </div>

 <div className="flex flex-col gap-stack-xs">
 <label htmlFor="confirm-password" className="font-label-md text-[14px] text-surface-variant font-medium">Konfirmasi Password Baru</label>
 <div className="relative">
 <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-[20px]">
 lock_clock
 </span>
 <input
 id="confirm-password"
 type={showConfirm ? 'text' : 'password'}
 required
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="w-full bg-black/20 border border-outline-variant/30 rounded-lg py-3 pl-10 pr-10 text-white font-body-md text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant/50"
 placeholder="••••••••"
 />
 <button
 type="button"
 onClick={() => setShowConfirm(!showConfirm)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-surface-variant transition-colors p-1"
 >
 <span className="material-symbols-outlined text-[20px]">{showConfirm ? 'visibility_off' : 'visibility'}</span>
 </button>
 </div>
 </div>

 <button
 type="submit"
 disabled={isLoading || password !== confirmPassword || password.length < 8}
 className="w-full bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-md text-[14px] font-semibold py-3 rounded-lg transition-colors mt-stack-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
 >
 {isLoading ? (
 <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
 ) : (
 <>
 Simpan Password Baru
 <span className="material-symbols-outlined text-[18px]">save</span>
 </>
 )}
 </button>
 </form>

 <div className="mt-stack-lg text-center">
 <Link to="/login" className="font-label-md text-[14px] text-primary-fixed-dim hover:text-primary-fixed transition-colors flex items-center justify-center gap-1 font-semibold">
 Batal
 </Link>
 </div>

 </div>
 </div>
 </div>
 );
};

export default ResetPassword;
