import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/auth.service';

const ForgotPassword = () => {
 const [email, setEmail] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [isSuccess, setIsSuccess] = useState(false);
 const [resetUrl, setResetUrl] = useState('');

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!email) {
 toast.error('Silakan masukkan email kampus Anda.');
 return;
 }

 if (!email.toLowerCase().trim().endsWith('.ac.id')) {
 toast.error('Gunakan email kampus yang berakhiran .ac.id');
 return;
 }

 setIsLoading(true);
 try {
 const res = await authService.forgotPassword(email);
 setIsSuccess(true);
 // Untuk simulasi testing, kita tangkap resetUrl dari response
 if (res.data?.resetUrl) {
 setResetUrl(res.data.resetUrl);
 }
 toast.success('Permintaan reset password berhasil dikirim.');
 } catch (err) {
 toast.error(err.response?.data?.message || 'Terjadi kesalahan, pastikan email Anda terdaftar.');
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
 key
 </span>
 </div>
 <h1 className="font-headline-lg-mobile md:font-headline-lg text-[24px] md:text-[32px] text-primary-fixed-dim mb-stack-xs text-center font-bold">Lupa Password?</h1>
 <p className="font-body-md text-[14px] text-surface-variant text-center">
 {isSuccess ? 'Tautan pemulihan telah dikirim. Silakan periksa email Anda.' : 'Jangan khawatir, masukkan email kampus Anda dan kami akan mengirimkan link untuk mereset password.'}
 </p>
 </div>

 {isSuccess ? (
 <div className="flex flex-col gap-stack-md">
 <div className="rounded-xl bg-secondary-container/20 border border-secondary-container/30 p-6 text-center">
 <div className="flex justify-center mb-4">
 <span className="material-symbols-outlined text-secondary-fixed text-[40px]">check_circle</span>
 </div>
 <h3 className="text-[18px] font-semibold text-secondary-fixed mb-2">Email Terkirim!</h3>
 <p className="text-[14px] text-surface-variant">
 Tautan pemulihan akun telah dikirim ke alamat email <span className="font-bold">{email}</span>. Silakan periksa kotak masuk (Inbox) atau folder Spam Anda.
 </p>
 {resetUrl && (
 <p className="text-[12px] text-surface-variant/70 mt-4 break-all bg-black/20 p-2 rounded">
 [Mock Dev Mode] <br/> <a href={resetUrl} className="text-primary-fixed-dim underline">{resetUrl}</a>
 </p>
 )}
 </div>
 <div className="mt-stack-lg text-center">
 <Link to="/login" className="font-label-md text-[14px] text-primary-fixed-dim hover:text-primary-fixed transition-colors flex items-center justify-center gap-1 font-semibold">
 <span className="material-symbols-outlined text-[16px]">arrow_back</span>
 Kembali ke Login
 </Link>
 </div>
 </div>
 ) : (
 <>
 <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
 <div className="flex flex-col gap-stack-xs">
 <label htmlFor="email" className="font-label-md text-[14px] text-surface-variant font-medium">Email Kampus</label>
 <div className="relative">
 <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-[20px]">
 mail
 </span>
 <input
 id="email"
 name="email"
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full bg-black/20 border border-outline-variant/30 rounded-lg py-3 pl-10 pr-4 text-white font-body-md text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant/50"
 placeholder="nim@mahasiswa.ac.id"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-md text-[14px] font-semibold py-3 rounded-lg transition-colors mt-stack-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
 >
 {isLoading ? (
 <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
 ) : (
 <>
 Kirim Link Reset
 <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
 </>
 )}
 </button>
 </form>

 <div className="mt-stack-lg text-center">
 <Link to="/login" className="font-label-md text-[14px] text-primary-fixed-dim hover:text-primary-fixed transition-colors flex items-center justify-center gap-1 font-semibold">
 <span className="material-symbols-outlined text-[16px]">arrow_back</span>
 Kembali ke Login
 </Link>
 </div>
 </>
 )}

 </div>
 </div>
 </div>
 );
};

export default ForgotPassword;
