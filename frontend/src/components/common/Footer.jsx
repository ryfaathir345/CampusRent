// src/components/common/Footer.jsx
// Simple footer component

import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 bg-blue-900 dark:bg-slate-950 text-white/80">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-white">
                <img src="/CampusRent.jpeg" alt="CampusRent Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-white text-lg">
                Campus<span className="text-blue-300">Rent</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/65">
              Platform peminjaman barang terpercaya antar mahasiswa kampus. Hemat, mudah, dan aman.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Navigasi</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Beranda', href: '/' },
                { label: 'Jelajahi Barang', href: '/items' },
                { label: 'Pinjam Barang', href: '/borrow' },
                { label: 'Daftarkan Barang', href: '/items/create' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="hover:text-blue-300 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Dukungan</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              <li>Tentang Kami</li>
              <li>Kebijakan Privasi</li>
              <li>Syarat & Ketentuan</li>
              <li>Hubungi Kami</li>
            </ul>
          </div>
        </div>

        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          <p>© 2026 CampusRent. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart size={12} style={{ color: '#f87171' }} /> for students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

