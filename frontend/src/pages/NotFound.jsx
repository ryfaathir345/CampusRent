import { Link } from 'react-router-dom';

const NotFound = () => {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-surface">
 <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 bg-error-container/20 border border-error-container/50">
 <span className="material-symbols-outlined text-[48px] text-error">sentiment_dissatisfied</span>
 </div>

 <h1 className="text-8xl md:text-9xl font-display-lg text-display-lg font-extrabold text-primary mb-4 drop-shadow-sm">404</h1>
 <h2 className="text-3xl font-headline-lg text-headline-lg text-on-surface mb-4">Halaman Tidak Ditemukan</h2>
 <p className="text-on-surface-variant font-body-lg text-body-lg max-w-md mx-auto mb-10">
 Oops! Halaman yang kamu cari tidak ada atau sudah dipindahkan. Yuk kembali ke beranda.
 </p>

 <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm mx-auto">
 <Link to="/" className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-title-md text-title-md rounded-xl hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
 <span className="material-symbols-outlined text-[20px]">home</span>
 Ke Beranda
 </Link>
 <Link to="/items" className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-primary text-primary font-title-md text-title-md rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
 <span className="material-symbols-outlined text-[20px]">search</span>
 Cari Barang
 </Link>
 </div>
 </div>
 );
};

export default NotFound;
