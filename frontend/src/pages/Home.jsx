// src/pages/Home.jsx
// Landing page — modern marketplace campus vibes

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import categoryService from '../services/category.service';
import {
  BookOpen,
  Laptop,
  Camera,
  Calculator,
  Headphones,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Star,
  ChevronRight,
  Package,
  Repeat2,
  CheckCircle2,
} from 'lucide-react';


const FEATURES = [
  {
    icon: Shield,
    title: 'Aman & Terpercaya',
    description: 'Setiap pengguna terverifikasi dengan NIM kampus. Transaksi aman dan tercatat.',
    textClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
  },
  {
    icon: Zap,
    title: 'Proses Cepat',
    description: 'Temukan barang yang kamu butuhkan dalam hitungan detik. Pinjam langsung hari ini.',
    textClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-900/30',
  },
  {
    icon: Repeat2,
    title: 'Hemat Biaya',
    description: 'Hemat pengeluaran dengan meminjam barang dari mahasiswa lain di kampus.',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
  },
  {
    icon: Users,
    title: 'Komunitas Kampus',
    description: 'Bergabung dengan ribuan mahasiswa yang saling membantu dalam satu platform.',
    textClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-900/30',
  },
];

const STEPS = [
  { step: '01', title: 'Daftar Akun', desc: 'Buat akun dengan NIM kampus kamu dalam 1 menit.' },
  { step: '02', title: 'Cari Barang', desc: 'Jelajahi koleksi barang yang tersedia dari mahasiswa lain.' },
  { step: '03', title: 'Ajukan Pinjam', desc: 'Kirim permintaan peminjaman dan tunggu konfirmasi pemilik.' },
  { step: '04', title: 'Ambil & Kembalikan', desc: 'Ambil barang sesuai jadwal dan kembalikan tepat waktu.' },
];

const TESTIMONIALS = [
  {
    name: 'Rina Aulia',
    nim: 'NIM 2021053421',
    faculty: 'Teknik Informatika',
    text: 'Sangat membantu! Saya bisa pinjam laptop cadangan saat laptop saya rusak menjelang deadline tugas.',
    rating: 5,
  },
  {
    name: 'Daffa Maulana',
    nim: 'NIM 2020041887',
    faculty: 'Teknik Elektro',
    text: 'Platform yang luar biasa. Saya bisa meminjamkan kamera saya dan membantu mahasiswa lain sekaligus mendapat feedback positif.',
    rating: 5,
  },
  {
    name: 'Sari Dewanti',
    nim: 'NIM 2022061234',
    faculty: 'Desain Komunikasi Visual',
    text: 'Temukan tripod dan lighting kit untuk proyek foto saya dalam hitungan menit. Recommended banget!',
    rating: 5,
  },
];

/* ── Component ─────────────────────────────── */
const Home = () => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getCategories().then(res => {
      setCategories(res.data);
    }).catch(console.error);
  }, []);

  return (
    <div>
      {/* ════ HERO SECTION ════ */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-950"
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
            top: -120,
            right: -100,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
            bottom: -80,
            left: -60,
            pointerEvents: 'none',
          }}
        />

        <div className="page-container py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Platform Mahasiswa Terpercaya</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-slate-100 leading-tight mb-6">
                Pinjam Barang
                <br />
                <span className="gradient-text dark:from-blue-400 dark:to-purple-400">Antar Mahasiswa</span>
                <br />
                <span className="text-gray-700 dark:text-slate-300">Lebih Mudah!</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-slate-400 leading-relaxed mb-8 max-w-lg">
                Butuh laptop, kalkulator, kamera, atau alat praktikum? 
                Temukan dari sesama mahasiswamu dan hemat pengeluaran bersama.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to={isAuthenticated ? '/items' : '/register'}
                  className="btn-primary text-base px-7 py-3"
                  id="hero-cta-primary"
                >
                  {isAuthenticated ? 'Jelajahi Barang' : 'Mulai Gratis'}
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/items"
                  className="btn-secondary text-base px-7 py-3"
                  id="hero-cta-secondary"
                >
                  Lihat Koleksi
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12">
                {[
                  { value: '1.200+', label: 'Mahasiswa Aktif' },
                  { value: '350+', label: 'Barang Tersedia' },
                  { value: '98%', label: 'Kepuasan Pengguna' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Card Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {categories.slice(0, 4).map((cat, i) => {
                const colors = [
                  { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                  { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
                  { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/30' },
                  { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' }
                ];
                const theme = colors[i % colors.length];
                return (
                  <Link
                    to={`/items?category=${cat.name.toLowerCase()}`}
                    key={cat.id}
                    className="glass-card p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 block dark:bg-slate-800/50 dark:border-slate-700"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${theme.bg}`}
                    >
                      <span className={`material-symbols-outlined text-[22px] ${theme.text}`}>
                        {cat.icon || 'category'}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm">{cat.name}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{cat.itemCount || 0} barang tersedia</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════ CATEGORIES SECTION ════ */}
      <section className="section bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="badge badge-blue mb-3 dark:bg-blue-900/30 dark:text-blue-400">Kategori Populer</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Temukan Barang yang Kamu Butuhkan</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-md mx-auto">
              Berbagai kategori barang tersedia dari sesama mahasiswa kampusmu
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const colors = [
                { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
                { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/30' },
                { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
                { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
                { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
              ];
              const theme = colors[idx % colors.length];
              return (
                <Link
                  key={cat.id}
                  to={`/items?category=${cat.name.toLowerCase()}`}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700 hover:shadow-lg transition-all hover:-translate-y-1 bg-white dark:bg-slate-900/50"
                  id={`category-${cat.name.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${theme.bg}`}
                  >
                    <span className={`material-symbols-outlined text-[26px] ${theme.text}`}>{cat.icon || 'category'}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm">{cat.name.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">{cat.itemCount || 0} item</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section className="section gradient-bg dark:bg-slate-900">
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="badge badge-blue mb-3 dark:bg-blue-900/30 dark:text-blue-400">Cara Kerja</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Mudah dalam 4 Langkah</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden lg:block absolute left-0 right-0 h-0.5 z-0 bg-gradient-to-r from-transparent via-blue-200 dark:via-slate-700 to-transparent"
              style={{
                top: '2rem',
              }}
            />

            {STEPS.map(({ step, title, desc }, i) => (
              <div
                key={step}
                className="relative z-10 text-center glass-card p-6 flex flex-col items-center dark:bg-slate-800/80 dark:border-slate-700"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                >
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FEATURES SECTION ════ */}
      <section className="section bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800">
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="badge badge-blue mb-3 dark:bg-blue-900/30 dark:text-blue-400">Keunggulan Kami</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Kenapa Memilih CampusRent?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, textClass, bgClass }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg transition-all hover:-translate-y-1 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-900/50"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${bgClass} ${textClass}`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ TESTIMONIALS ════ */}
      <section className="section bg-blue-50/50 dark:bg-slate-900/50">
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="badge badge-blue mb-3 dark:bg-blue-900/30 dark:text-blue-400">Testimoni</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Apa Kata Mereka?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, nim, faculty, text, rating }) => (
              <div key={name} className="glass-card p-6 dark:bg-slate-800/50 dark:border-slate-700">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
                  >
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{name}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-400">{faculty}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{nim}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA BANNER ════ */}
      {!isAuthenticated && (
        <section className="py-20">
          <div className="page-container">
            <div
              className="rounded-3xl p-12 text-center text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)' }}
            >
              {/* Decorative */}
              <div
                style={{
                  position: 'absolute',
                  top: -60,
                  right: -60,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -40,
                  left: -40,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                }}
              />

              <div className="relative z-10">
                <CheckCircle2 size={48} className="mx-auto mb-4 opacity-90" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Siap Mulai Meminjam atau Meminjamkan?
                </h2>
                <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
                  Bergabung gratis dan mulai berinteraksi dengan ribuan mahasiswa di kampusmu hari ini.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    to="/register"
                    id="cta-register-btn"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-all hover:shadow-lg"
                  >
                    Daftar Gratis <ChevronRight size={18} />
                  </Link>
                  <Link
                    to="/login"
                    id="cta-login-btn"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold border-2 border-white text-white hover:bg-white hover:text-blue-700 transition-all"
                  >
                    Masuk
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

