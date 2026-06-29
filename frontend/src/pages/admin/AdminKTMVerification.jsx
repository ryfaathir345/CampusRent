import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const AdminKTMVerification = () => {
  const [ktmUsers, setKtmUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchKtmUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUnverifiedUsers();
      setKtmUsers(res.data);
    } catch (err) {
      toast.error('Gagal memuat data verifikasi KTM');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKtmUsers();
  }, []);

  const handleVerify = async (userId, action) => {
    try {
      await adminService.verifyKtm(userId, { status: action });
      toast.success(action === 'APPROVED' ? 'KTM disetujui' : 'KTM ditolak');
      fetchKtmUsers();
    } catch (err) {
      toast.error('Gagal memproses verifikasi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-stack-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Pusat Verifikasi KTM</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Tinjau dan validasi kartu identitas mahasiswa untuk menjaga keamanan komunitas.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-highest p-1 rounded-xl">
          <button className="px-4 py-2 bg-white rounded-lg shadow-sm font-label-md text-primary">Antrian ({ktmUsers.length})</button>
          <button className="px-4 py-2 font-label-md text-on-surface-variant hover:text-primary transition-colors">Terkunci (0)</button>
        </div>
      </header>

      {ktmUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-outline text-5xl">task_alt</span>
          </div>
          <h3 className="font-title-md text-title-md text-on-surface">Antrian Kosong</h3>
          <p className="text-body-md text-on-surface-variant max-w-md mt-2">Tidak ada mahasiswa yang menunggu verifikasi KTM saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-gutter">
          {ktmUsers.map(user => (
            <div key={user.id} className="glass-card rounded-2xl overflow-hidden shadow-md flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-outline-variant/20">
              <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-highest">
                {user.ktmUrl ? (
                  <img 
                    src={`${UPLOADS_URL}${user.ktmUrl}`} 
                    alt={`KTM ${user.nama}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-6xl">image_not_supported</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">Pending</span>
                </div>
                {user.ktmUrl && (
                  <button onClick={() => window.open(`${UPLOADS_URL}${user.ktmUrl}`, '_blank')} className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">zoom_in</span>
                  </button>
                )}
              </div>
              
              <div className="p-stack-md flex flex-col gap-4 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-title-md text-title-md text-on-surface">{user.nama}</h3>
                    <div className="flex items-center gap-2 text-on-surface-variant mt-1">
                      <span className="material-symbols-outlined text-[18px]">school</span>
                      <span className="font-label-md">{user.jurusan || 'Universitas Tidak Ada'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">fingerprint</span>
                      <span className="font-label-md">NIM: {user.nim || 'NIM Tidak Ada'}</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-highest p-2 rounded-xl text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <button 
                    onClick={() => handleVerify(user.id, 'REJECTED')}
                    className="flex items-center justify-center gap-2 py-4 px-6 bg-error/10 hover:bg-error hover:text-white text-error font-bold rounded-xl transition-all active:scale-95 duration-150 border border-error/20"
                  >
                    <span className="material-symbols-outlined">close</span>
                    <span>Tolak</span>
                  </button>
                  <button 
                    onClick={() => handleVerify(user.id, 'APPROVED')}
                    className="flex items-center justify-center gap-2 py-4 px-6 bg-secondary-container hover:bg-secondary hover:text-white text-on-secondary-container font-bold rounded-xl transition-all active:scale-95 duration-150 border border-secondary/20"
                  >
                    <span className="material-symbols-outlined">check</span>
                    <span>Setujui</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AdminKTMVerification;
