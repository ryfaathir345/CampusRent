import { Link } from 'react-router-dom';

const Footer = () => {
 return (
 <footer className="bg-surface-container-highest w-full pt-stack-xl pb-stack-lg border-t border-outline-variant/20 mt-auto">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter max-w-container-max mx-auto px-margin-mobile">
 <div className="flex flex-col gap-stack-sm">
 <span className="font-headline-lg text-headline-lg text-secondary">
 CampusRent
 </span>
 <p className="text-on-surface-variant font-body-md text-body-md text-sm">
 Sistem peminjaman barang antar mahasiswa yang terpercaya dan mudah.
 </p>
 </div>
 <div className="flex flex-col gap-2">
 <Link to="#" className="text-on-surface-variant hover:text-secondary hover:underline underline-offset-4 font-label-sm text-label-sm w-fit transition-opacity duration-300">
 Tentang Kami
 </Link>
 <Link to="#" className="text-on-surface-variant hover:text-secondary hover:underline underline-offset-4 font-label-sm text-label-sm w-fit transition-opacity duration-300">
 Kebijakan Privasi
 </Link>
 <Link to="#" className="text-on-surface-variant hover:text-secondary hover:underline underline-offset-4 font-label-sm text-label-sm w-fit transition-opacity duration-300">
 Syarat & Ketentuan
 </Link>
 </div>
 <div className="flex flex-col gap-2">
 <Link to="#" className="text-on-surface-variant hover:text-secondary hover:underline underline-offset-4 font-label-sm text-label-sm w-fit transition-opacity duration-300">
 Bantuan
 </Link>
 <Link to="#" className="text-on-surface-variant hover:text-secondary hover:underline underline-offset-4 font-label-sm text-label-sm w-fit transition-opacity duration-300">
 Kontak
 </Link>
 </div>
 <div className="col-span-1 md:col-span-3 mt-stack-md pt-stack-md border-t border-outline-variant/20 text-center">
 <span className="text-on-surface-variant font-label-sm text-label-sm">
 © 2026 CampusRent. Made with ❤️ for students
 </span>
 </div>
 </div>
 </footer>
 );
};

export default Footer;
