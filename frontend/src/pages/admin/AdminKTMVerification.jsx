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

  const handleVerifyAll = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menyetujui SEMUA antrean verifikasi KTM?')) return;
    
    try {
      const res = await adminService.verifyAllKtm();
      toast.success(res.message || 'Semua KTM berhasil disetujui');
      fetchKtmUsers();
    } catch (err) {
      toast.error('Gagal memproses verifikasi massal');
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
    <div className="animate-fade-in max-w-[1400px] mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="font-bold text-gray-800 text-title-md dark:text-white/90">KTM Verification</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verify student identities to maintain trust in the CampusRent ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
          
          {ktmUsers.length > 0 && (
            <button 
              onClick={handleVerifyAll}
              className="px-5 py-2.5 bg-success-500 text-white rounded-full hover:bg-success-600 transition-colors text-sm font-medium shadow-theme-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              Approve Semua
            </button>
          )}

          <button className="px-5 py-2.5 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors text-sm font-medium shadow-theme-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">history</span>
            View History
          </button>
        </div>
      </div>

      {/* Dashboard Stats Brief */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 group hover:shadow-theme-sm transition-all">
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Pending Now</p>
          <p className="text-title-xl font-bold text-brand-500 dark:text-brand-400">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 group hover:shadow-theme-sm transition-all">
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Avg. Wait Time</p>
          <p className="text-title-xl font-bold text-warning-500 dark:text-warning-400">{stats.avgWaitTime}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 group hover:shadow-theme-sm transition-all">
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Today's Total</p>
          <p className="text-title-xl font-bold text-success-500 dark:text-success-400">{stats.todaysTotal}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 group hover:shadow-theme-sm transition-all">
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Approval Rate</p>
          <p className="text-title-xl font-bold text-gray-800 dark:text-white/90">{stats.approvalRate}</p>
        </div>
      </div>

      {/* Main Verification Grid */}
      {ktmUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-gray-400 text-5xl">task_alt</span>
          </div>
          <h3 className="text-title-md font-bold text-gray-800 dark:text-white/90">All caught up!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mt-2">No pending verifications at the moment. Take a break or check the history for past actions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {ktmUsers.map(user => (
            <div key={user.id} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden flex flex-col group hover:shadow-theme-sm transition-all">
              
              <div className="relative h-40 bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10"></div>
                {/* Fallback avatar if no profile picture, but KTM is the focus */}
                <div className="w-16 h-16 bg-brand-100 dark:bg-brand-500/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center font-bold text-2xl z-0">
                  {user.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="px-2 py-0.5 bg-warning-50 text-warning-600 dark:bg-warning-500/20 dark:text-warning-500 text-[10px] font-bold rounded-md uppercase">Pending</span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-800 text-title-sm dark:text-white/90 mb-1">{user.nama}</h3>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[16px]">id_card</span>
                    <p className="text-sm font-medium">{user.nim || 'NIM Tidak Ada'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                    <span className="material-symbols-outlined text-[16px]">account_balance</span>
                    <p className="text-sm font-medium truncate">{user.jurusan || 'Universitas Tidak Ada'}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">KTM Document</span>
                  </div>
                  <div 
                    className="relative group/ktm cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-400 transition-all bg-white dark:bg-gray-900"
                    onClick={() => window.open(`${UPLOADS_URL}${user.ktmUrl}`, '_blank')}
                  >
                    <img 
                      src={`${UPLOADS_URL}${user.ktmUrl}`} 
                      alt={`KTM ${user.nama}`} 
                      className="w-full h-24 object-cover opacity-90 group-hover/ktm:scale-105 transition-transform" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-500/20 opacity-0 group-hover/ktm:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-brand-500 dark:text-brand-400 text-3xl drop-shadow-md">visibility</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleVerify(user.id, 'APPROVED')}
                    className="py-2.5 bg-success-50 text-success-600 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-500 dark:hover:bg-success-500/20 font-medium text-sm rounded-xl transition-colors active:scale-95"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleVerify(user.id, 'REJECTED')}
                    className="py-2.5 bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-500 dark:hover:bg-error-500/20 font-medium text-sm rounded-xl transition-colors active:scale-95"
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
