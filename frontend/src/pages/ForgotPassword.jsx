// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, BookOpen } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600 shadow-md">
              <BookOpen size={24} color="white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Lupa Password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            Jangan khawatir! Masukkan email kampus yang terdaftar dan kami akan memberikan tautan pemulihan.
          </p>
        </div>

        {isSuccess ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl bg-green-50 p-6 text-center border border-green-200">
              <div className="flex justify-center mb-4">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-green-800 mb-2">Email Terkirim!</h3>
              <p className="text-sm text-green-700">
                Tautan pemulihan akun telah dikirim ke alamat email Anda. Silakan periksa kotak masuk (Inbox) atau folder Spam/Junk Anda.
              </p>
            </div>
            
            <div className="text-center">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Kembali ke halaman Login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Kampus</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="nama@kampus.ac.id"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" /> Mengirim...
                  </span>
                ) : (
                  'Minta Tautan Pemulihan'
                )}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <Link to="/login" className="font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2 text-sm transition-colors">
                <ArrowLeft size={16} /> Kembali ke Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
