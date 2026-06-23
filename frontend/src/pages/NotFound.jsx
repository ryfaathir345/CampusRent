// src/pages/NotFound.jsx
// 404 Not Found page

import { Link } from 'react-router-dom';
import { BookOpen, Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 50%, #e0e7ff 100%)' }}
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
        <BookOpen size={30} color="white" />
      </div>

      <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Oops! Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        Yuk kembali ke beranda.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link to="/" className="btn-primary">
          <Home size={16} /> Ke Beranda
        </Link>
        <Link to="/items" className="btn-secondary">
          <Search size={16} /> Cari Barang
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
