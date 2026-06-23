// src/components/layouts/MainLayout.jsx
// Main layout wrapper with Navbar and Footer

import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { Toaster } from 'react-hot-toast';

const MainLayout = ({ children, hideFooter = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
            },
          },
        }}
      />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
