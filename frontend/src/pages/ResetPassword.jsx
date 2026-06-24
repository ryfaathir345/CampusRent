// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, Loader2, ArrowRight, BookOpen, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../services/auth.service';

const getPasswordStrength = (pass) => {
  if (!pass) return { level: 0, label: '', color: '#e5e7eb' };
  let score = 0;
  if (pass.length >= 8)           score++;
  if (/[A-Z]/.test(pass))         score++;
  if (/[0-9]/.test(pass))         score++;
  if (/[^A-Za-z0-9]/.test(pass))  score++;
  const map = [
    { level: 1, label: 'Lemah',        color: '#ef4444' },
    { level: 2, label: 'Cukup',        color: '#f59e0b' },
    { level: 3, label: 'Kuat',         color: '#3b82f6' },
    { level: 4, label: 'Sangat Kuat',  color: '#10b981' },
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600 shadow-md">
              <BookOpen size={24} color="white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Buat Kata Sandi Baru</h2>
          <p className="mt-2 text-sm text-gray-600">
            Masukkan kata sandi baru Anda di bawah ini untuk mengakses kembali akun CampusRent Anda.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi Baru</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Password strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div
                        key={lvl}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{ background: lvl <= pwStrength.level ? pwStrength.color : '#e5e7eb' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 font-medium" style={{ color: pwStrength.color }}>
                    {pwStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Kata Sandi Baru</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ulangi kata sandi baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || password !== confirmPassword || password.length < 8}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" /> Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Simpan Kata Sandi Baru <ArrowRight size={18} />
                </span>
              )}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <Link to="/login" className="font-medium text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Batalkan dan kembali ke Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
