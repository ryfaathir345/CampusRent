// src/pages/Login.jsx
// Halaman login mahasiswa

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, Mail, Lock, BookOpen,
  ArrowRight, Loader2, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Kembalikan ke halaman yang diminta sebelum redirect ke login
  const from = location.state?.from?.pathname || '/';

  // ─── Validasi client-side ─────────────────────────
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

  // ─── Submit ───────────────────────────────────────
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
      // Tangani error validasi dari server
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
    <div
      className="min-h-screen flex bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      {/* ── Left Branding Panel ─────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)' }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: 60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', top: '40%', right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <BookOpen size={20} color="white" />
          </div>
          <span className="text-white font-bold text-xl">CampusRent</span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
            <ShieldCheck size={28} color="white" />
          </div>
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Selamat datang
            <br />
            kembali! 👋
          </h2>
          <p className="text-blue-200 leading-relaxed">
            Masuk ke akun CampusRent kamu dan lanjutkan pengalaman meminjam barang antar mahasiswa dengan mudah.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              'Pinjam barang kapan saja',
              'Terverifikasi dengan NIM kampus',
              'Komunitas mahasiswa terpercaya',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-blue-100 text-sm">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                  <ArrowRight size={11} color="white" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-blue-400 text-xs">
          © 2024 CampusRent · Platform Mahasiswa
        </p>
      </div>

      {/* ── Right Form Panel ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              <BookOpen size={18} color="white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              Kampus<span className="text-blue-600">Pinjam</span>
            </span>
          </div>

          <div className="glass-card p-8 md:p-10">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Masuk ke Akun</h1>
              <p className="text-gray-500 text-sm mt-2">
                Belum punya akun?{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                  Daftar gratis
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Email */}
              <div>
                <label htmlFor="login-email" className="form-label">
                  Email Kampus
                </label>
                <div className="relative">
                  <Mail size={16} style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', color: errors.email ? '#ef4444' : '#9ca3af',
                  }} />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@kampus.ac.id"
                    value={form.email}
                    onChange={handleChange}
                    className="form-input"
                    style={{
                      paddingLeft: 42,
                      borderColor: errors.email ? '#ef4444' : undefined,
                    }}
                    aria-invalid={!!errors.email}
                    aria-describedby="login-email-error"
                  />
                </div>
                {errors.email && (
                  <p id="login-email-error" className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="form-label" style={{ marginBottom: 0 }}>
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-blue-600 font-medium hover:underline">
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', color: errors.password ? '#ef4444' : '#9ca3af',
                  }} />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={handleChange}
                    className="form-input"
                    style={{
                      paddingLeft: 42, paddingRight: 44,
                      borderColor: errors.password ? '#ef4444' : undefined,
                    }}
                    aria-invalid={!!errors.password}
                    aria-describedby="login-password-error"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p id="login-password-error" className="text-xs text-red-500 mt-1.5 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 text-base mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sedang masuk...
                  </>
                ) : (
                  <>
                    Masuk <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">atau</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Redirect to register */}
            <Link
              to="/register"
              id="go-to-register-btn"
              className="btn-secondary w-full justify-center py-3 text-sm"
            >
              Buat Akun Baru
            </Link>
          </div>

          {/* Info keamanan */}
          <p className="text-center text-xs text-gray-400 mt-5 flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} style={{ color: '#10b981' }} />
            Informasi kamu dilindungi dengan enkripsi JWT & bcrypt
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

