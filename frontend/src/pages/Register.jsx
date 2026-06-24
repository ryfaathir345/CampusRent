// src/pages/Register.jsx
// Halaman registrasi mahasiswa baru

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, Mail, Lock, User, BookOpen,
  Hash, Layers, Phone, ArrowRight, Loader2,
  CheckCircle2, GraduationCap, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';

// ── Daftar Jurusan / Program Studi ──────────────────
const JURUSAN_LIST = [
  // Teknik
  'Teknik Informatika',
  'Sistem Informasi',
  'Teknik Elektro',
  'Teknik Mesin',
  'Teknik Sipil',
  'Teknik Kimia',
  'Teknik Industri',
  'Teknik Lingkungan',
  // Komputer
  'Ilmu Komputer',
  'Teknologi Informasi',
  // Sains
  'Matematika',
  'Fisika',
  'Kimia',
  'Biologi',
  // Ekonomi & Bisnis
  'Manajemen',
  'Akuntansi',
  'Ekonomi Pembangunan',
  'Bisnis Digital',
  // Sosial
  'Ilmu Komunikasi',
  'Hubungan Internasional',
  'Ilmu Hukum',
  'Administrasi Bisnis',
  // Kesehatan
  'Kedokteran',
  'Keperawatan',
  'Farmasi',
  'Kesehatan Masyarakat',
  // Desain & Seni
  'Desain Komunikasi Visual',
  'Arsitektur',
  'Desain Interior',
  // Pendidikan
  'Pendidikan Matematika',
  'Pendidikan Bahasa Indonesia',
  'Pendidikan Bahasa Inggris',
  'PGSD',
  // Lain
  'Lainnya',
];

// ── Password Strength ────────────────────────────────
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

// ── Komponen Input ───────────────────────────────────
const InputField = ({ id, label, icon: Icon, error, children, hint }) => (
  <div>
    <label htmlFor={id} className="form-label">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon size={15} style={{
          position: 'absolute', left: 13, top: '50%',
          transform: 'translateY(-50%)',
          color: error ? '#ef4444' : '#9ca3af',
          pointerEvents: 'none', zIndex: 1,
        }} />
      )}
      {children}
    </div>
    {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
    {!error && hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

// ── Main Component ────────────────────────────────────
const Register = () => {
  const [form, setForm] = useState({
    nama:            '',
    email:           '',
    nim:             '',
    jurusan:         '',
    universitas:     '',
    whatsapp:        '',
    password:        '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [errors,       setErrors]       = useState({});
  const [agreed,       setAgreed]       = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const pwStrength = getPasswordStrength(form.password);

  // ─── Validasi client-side ───────────────────────────
  const validate = () => {
    const e = {};
    if (!form.nama.trim() || form.nama.trim().length < 3)
      e.nama = 'Nama lengkap minimal 3 karakter';

    if (!form.email)
      e.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Format email tidak valid';
    else if (!form.email.toLowerCase().trim().endsWith('.ac.id'))
      e.email = 'Gunakan email kampus yang berakhiran .ac.id';

    if (!form.password)
      e.password = 'Password wajib diisi';
    else if (form.password.length < 8)
      e.password = 'Password minimal 8 karakter';

    if (!form.confirmPassword)
      e.confirmPassword = 'Konfirmasi password wajib diisi';
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Password tidak cocok';

    if (form.nim && !/^\d{5,20}$/.test(form.nim.trim()))
      e.nim = 'NIM harus berupa angka (5-20 digit)';

    if (form.whatsapp && !/^(\+62|08)\d{7,13}$/.test(form.whatsapp.trim()))
      e.whatsapp = 'Format WhatsApp tidak valid (08xx / +62xx)';

    if (!agreed)
      e.terms = 'Kamu harus menyetujui syarat & ketentuan';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ─── Submit ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const res = await authService.register(payload);

      login(res.data.user, res.data.token);
      toast.success(res.message || 'Registrasi berhasil! Selamat bergabung 🎉');
      navigate('/');
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        setErrors(serverErrors);
        toast.error('Mohon periksa kembali data yang kamu masukkan.');
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
        <div style={{ position: 'absolute', top: -80, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: 40, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <BookOpen size={20} color="white" />
          </div>
          <span className="text-white font-bold text-xl">CampusRent</span>
        </div>

        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
            <GraduationCap size={28} color="white" />
          </div>
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Bergabung &
            <br />
            mulai hemat! 💰
          </h2>
          <p className="text-blue-200 leading-relaxed">
            Daftarkan dirimu dan akses ribuan barang dari mahasiswa kampus. Gratis, mudah, aman.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: CheckCircle2, text: 'Daftar gratis, tanpa biaya' },
              { icon: CheckCircle2, text: 'Terverifikasi NIM mahasiswa' },
              { icon: CheckCircle2, text: 'Data dienkripsi & aman' },
              { icon: CheckCircle2, text: 'Komunitas mahasiswa aktif' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-blue-100 text-sm">
                <Icon size={15} style={{ color: '#86efac', flexShrink: 0 }} />
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-400 text-xs">
          © 2024 CampusRent · Platform Mahasiswa
        </p>
      </div>

      {/* ── Right Form Panel ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg py-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
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
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900">Buat Akun Mahasiswa</h1>
              <p className="text-gray-500 text-sm mt-2">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* ── Nama Lengkap ── */}
              <InputField id="reg-nama" label="Nama Lengkap *" icon={User} error={errors.nama}>
                <input
                  id="reg-nama"
                  name="nama"
                  type="text"
                  placeholder="Nama lengkap kamu"
                  value={form.nama}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: 40, borderColor: errors.nama ? '#ef4444' : undefined }}
                  autoComplete="name"
                />
              </InputField>

              {/* ── Email ── */}
              <InputField id="reg-email" label="Email Kampus *" icon={Mail} error={errors.email}>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="nama@kampus.ac.id"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: 40, borderColor: errors.email ? '#ef4444' : undefined }}
                  autoComplete="email"
                />
              </InputField>

              {/* ── NIM + Jurusan (2 kolom) ── */}
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  id="reg-nim"
                  label="NIM"
                  icon={Hash}
                  error={errors.nim}
                  hint="Opsional"
                >
                  <input
                    id="reg-nim"
                    name="nim"
                    type="text"
                    inputMode="numeric"
                    placeholder="2021xxxxxxx"
                    value={form.nim}
                    onChange={handleChange}
                    className="form-input"
                    style={{ paddingLeft: 38, borderColor: errors.nim ? '#ef4444' : undefined }}
                  />
                </InputField>

                <InputField
                  id="reg-jurusan"
                  label="Jurusan / Prodi"
                  icon={Layers}
                  error={errors.jurusan}
                  hint="Opsional"
                >
                  <select
                    id="reg-jurusan"
                    name="jurusan"
                    value={form.jurusan}
                    onChange={handleChange}
                    className="form-input appearance-none"
                    style={{ paddingLeft: 38 }}
                  >
                    <option value="">Pilih Jurusan</option>
                    {JURUSAN_LIST.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </InputField>
              </div>

              {/* ── Universitas + WhatsApp ── */}
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  id="reg-universitas"
                  label="Universitas"
                  icon={GraduationCap}
                  error={errors.universitas}
                  hint="Cth: Universitas Brawijaya"
                >
                  <input
                    id="reg-universitas"
                    name="universitas"
                    type="text"
                    placeholder="Nama Universitas"
                    value={form.universitas}
                    onChange={handleChange}
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                  />
                </InputField>

                <InputField
                  id="reg-whatsapp"
                  label="Nomor WhatsApp"
                  icon={Phone}
                  error={errors.whatsapp}
                  hint="Untuk koordinasi pinjam"
                >
                  <input
                    id="reg-whatsapp"
                    name="whatsapp"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={form.whatsapp}
                    onChange={handleChange}
                    className="form-input"
                    style={{ paddingLeft: 38, borderColor: errors.whatsapp ? '#ef4444' : undefined }}
                    autoComplete="tel"
                  />
                </InputField>
              </div>

              {/* ── Password ── */}
              <div>
                <label htmlFor="reg-password" className="form-label">Password *</label>
                <div className="relative">
                  <Lock size={15} style={{
                    position: 'absolute', left: 13, top: '50%',
                    transform: 'translateY(-50%)', color: errors.password ? '#ef4444' : '#9ca3af',
                  }} />
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter"
                    value={form.password}
                    onChange={handleChange}
                    className="form-input"
                    style={{ paddingLeft: 38, paddingRight: 44, borderColor: errors.password ? '#ef4444' : undefined }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength bar */}
                {form.password && (
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
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.password}</p>
                )}
              </div>

              {/* ── Konfirmasi Password ── */}
              <div>
                <label htmlFor="reg-confirm" className="form-label">Konfirmasi Password *</label>
                <div className="relative">
                  <Lock size={15} style={{
                    position: 'absolute', left: 13, top: '50%',
                    transform: 'translateY(-50%)', color: errors.confirmPassword ? '#ef4444' : '#9ca3af',
                  }} />
                  <input
                    id="reg-confirm"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    style={{ paddingLeft: 38, paddingRight: 44, borderColor: errors.confirmPassword ? '#ef4444' : undefined }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                    aria-label="Toggle confirm password"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <p className="text-xs text-emerald-600 mt-1.5 font-medium flex items-center gap-1">
                    <CheckCircle2 size={12} /> Password cocok
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

              {/* ── Terms ── */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    id="reg-terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (errors.terms) setErrors((p) => ({ ...p, terms: '' }));
                    }}
                    className="mt-0.5 w-4 h-4 rounded accent-blue-600 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-600 leading-snug">
                    Saya menyetujui{' '}
                    <Link to="/terms" className="text-blue-600 hover:underline font-medium">
                      Syarat & Ketentuan
                    </Link>{' '}
                    dan{' '}
                    <Link to="/privacy" className="text-blue-600 hover:underline font-medium">
                      Kebijakan Privasi
                    </Link>{' '}
                    CampusRent
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.terms}</p>
                )}
              </div>

              {/* ── Submit ── */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 text-base mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Mendaftarkan akun...
                  </>
                ) : (
                  <>
                    Daftar Sekarang <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5 flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} style={{ color: '#10b981' }} />
            Data dienkripsi dengan bcrypt & JWT
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

