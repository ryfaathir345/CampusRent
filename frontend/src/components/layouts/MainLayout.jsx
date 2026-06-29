// src/components/layouts/MainLayout.jsx
// Main layout wrapper with Navbar and Footer

import Navbar from '../common/Navbar';
import Footer from '../common/Footer';


const MainLayout = ({ children, hideFooter = false }) => {
 return (
 <div className="min-h-screen flex flex-col">

 <Navbar />
 <main className="flex-1">
 {children}
 </main>
 {!hideFooter && <Footer />}
 </div>
 );
};

export default MainLayout;
