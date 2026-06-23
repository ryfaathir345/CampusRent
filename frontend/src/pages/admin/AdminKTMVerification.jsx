import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const AdminKTMVerification = () => {
  const [ktmUsers, setKtmUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    avgWaitTime: '1.5h', // Mock for UI
    todaysTotal: 158, // Mock for UI
    approvalRate: '92%' // Mock for UI
  });

  const fetchKtmUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUnverifiedUsers();
      setKtmUsers(res.data);
      setStats(prev => ({ ...prev, pending: res.data.length }));
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
    <div className="animate-fade-in max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-stack-lg gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">KTM Verification</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Verify student identities to maintain trust in the CampusRent ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-surface-container-highest text-on-surface font-label-md text-label-md rounded-full border border-outline-variant hover:bg-surface-dim transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
          <button className="px-5 py-2.5 bg-primary text-white font-label-md text-label-md rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">history</span>
            View History
          </button>
        </div>
      </div>

      {/* Dashboard Stats Brief */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-stack-lg">
        <div className="glass-card p-5 rounded-2xl border border-outline-variant shadow-sm bg-white">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Pending Now</p>
          <p className="font-headline-md text-headline-md text-primary mt-1">{stats.pending}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-outline-variant shadow-sm bg-white">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Avg. Wait Time</p>
          <p className="font-headline-md text-headline-md text-secondary mt-1">{stats.avgWaitTime}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-outline-variant shadow-sm bg-white">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Today's Total</p>
          <p className="font-headline-md text-headline-md text-tertiary mt-1">{stats.todaysTotal}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-outline-variant shadow-sm bg-white">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Approval Rate</p>
          <p className="font-headline-md text-headline-md text-on-surface mt-1">{stats.approvalRate}</p>
        </div>
      </div>

      {/* Main Verification Grid */}
      {ktmUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-outline text-5xl">task_alt</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">All caught up!</h3>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mt-2">No pending verifications at the moment. Take a break or check the history for past actions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ktmUsers.map(user => (
            <div key={user.id} className="glass-card bg-white rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-outline-variant">
              
              <div className="relative h-48 bg-primary-container/20 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                {/* Fallback avatar if no profile picture, but KTM is the focus */}
                <div className="w-20 h-20 bg-primary-container text-white rounded-full flex items-center justify-center font-display-lg text-4xl z-0">
                  {user.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-md uppercase">Pending</span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">{user.nama}</h3>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">id_card</span>
                    <p className="font-body-md text-body-md">{user.nim || 'NIM Tidak Ada'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant mt-1">
                    <span className="material-symbols-outlined text-[16px]">account_balance</span>
                    <p className="font-body-md text-body-md truncate">{user.jurusan || 'Universitas Tidak Ada'}</p>
                  </div>
                </div>
                
                <div className="bg-surface-container-low rounded-xl p-3 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">KTM Document</span>
                  </div>
                  <div 
                    className="relative group/ktm cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-outline-variant hover:border-primary transition-all bg-surface-container"
                    onClick={() => window.open(`${UPLOADS_URL}${user.ktmUrl}`, '_blank')}
                  >
                    <img 
                      src={`${UPLOADS_URL}${user.ktmUrl}`} 
                      alt={`KTM ${user.nama}`} 
                      className="w-full h-24 object-cover opacity-90 group-hover/ktm:scale-105 transition-transform" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20 opacity-0 group-hover/ktm:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-primary text-3xl drop-shadow-md">visibility</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleVerify(user.id, 'APPROVED')}
                    className="py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-label-md text-label-md rounded-full transition-all shadow-md shadow-emerald-200 active:scale-95"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleVerify(user.id, 'REJECTED')}
                    className="py-2.5 bg-[#f43f5e] hover:bg-[#e11d48] text-white font-label-md text-label-md rounded-full transition-all shadow-md shadow-rose-200 active:scale-95"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminKTMVerification;
