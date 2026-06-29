import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profile.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const AdminProfile = () => {
  const { user, login } = useAuth();
  const [profileData, setProfileData] = useState({ nama: '', whatsapp: '', isVerified: false });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profRes = await profileService.getProfile();
        setProfileData({
          nama: profRes.data.nama || '',
          whatsapp: profRes.data.whatsapp || '',
          isVerified: profRes.data.isVerified || false
        });
        setPhotoPreview(profRes.data.fotoProfil ? `${UPLOADS_URL}${profRes.data.fotoProfil}` : null);
      } catch (err) {
        toast.error('Gagal memuat data profil');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const handleUpdateProfile = async (e) => {
    if(e) e.preventDefault();
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Konfirmasi password tidak cocok');
    }

    setIsSaving(true);
    try {
      // Update Profile
      const res = await profileService.updateProfile(profileData);
      
      // Update Password if filled
      if (passwords.newPassword && passwords.oldPassword) {
        await profileService.changePassword({ 
          oldPassword: passwords.oldPassword, 
          newPassword: passwords.newPassword 
        });
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        toast.success('Profil & Password berhasil diperbarui');
      } else {
        toast.success('Profil berhasil diperbarui');
      }

      if (res.data && res.data.data) {
        login(res.data.data, localStorage.getItem('token'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Ukuran maksimal 5MB');
    }

    const formData = new FormData();
    formData.append('fotoProfil', file);

    const toastId = toast.loading('Mengunggah foto...');
    try {
      const res = await profileService.updateAvatar(formData);
      setPhotoPreview(`${UPLOADS_URL}${res.data.fotoProfil}`);
      toast.success('Foto profil berhasil diperbarui', { id: toastId });
    } catch (err) {
      toast.error('Gagal mengunggah foto', { id: toastId });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-container-max mx-auto w-full pb-stack-xl">
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Admin Profile & Settings</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Manage your personal credentials and global system configurations.</p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            className="px-6 py-2.5 border border-outline text-on-surface font-label-md rounded-full hover:bg-surface-container transition-all"
            onClick={() => window.location.reload()}
          >
            Batal
          </button>
          <button 
            onClick={handleUpdateProfile}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-label-md rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
          >
            {isSaving && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Personal Profile Section (Bento Large) */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          <div className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/30">
            <h3 className="font-title-md text-title-md text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">person</span>
              Informasi Personal
            </h3>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="h-32 w-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-surface-container-high flex items-center justify-center text-4xl font-bold text-on-surface-variant">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Admin" className="w-full h-full object-cover" />
                  ) : (
                    user.nama.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="space-y-1">
                  <label className="text-label-sm text-on-surface-variant px-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={profileData.nama}
                    onChange={(e) => setProfileData({ ...profileData, nama: e.target.value })}
                    className="w-full bg-surface-container-low border-outline-variant/50 border rounded-xl px-4 py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm text-on-surface-variant px-1">Alamat Email</label>
                  <input 
                    type="email" 
                    value={user.email}
                    disabled
                    className="w-full bg-surface-container-highest/30 border-outline-variant/50 border rounded-xl px-4 py-2.5 text-on-surface-variant cursor-not-allowed outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm text-on-surface-variant px-1">Admin Role</label>
                  <input 
                    type="text" 
                    value="System Owner"
                    disabled
                    className="w-full bg-surface-container-highest/30 border-outline-variant/50 border rounded-xl px-4 py-2.5 text-on-surface-variant cursor-not-allowed outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm text-on-surface-variant px-1">Nomor WhatsApp</label>
                  <input 
                    type="text" 
                    value={profileData.whatsapp}
                    onChange={(e) => setProfileData({ ...profileData, whatsapp: e.target.value })}
                    className="w-full bg-surface-container-low border-outline-variant/50 border rounded-xl px-4 py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="08..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-outline-variant/20">
              <h4 className="font-label-md text-on-surface font-bold mb-4">Ubah Password</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-label-sm text-on-surface-variant px-1">Password Saat Ini</label>
                  <input 
                    type="password" 
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                    className="w-full bg-surface-container-low border-outline-variant/50 border rounded-xl px-4 py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="Masukkan password lama"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm text-on-surface-variant px-1">Password Baru</label>
                  <input 
                    type="password" 
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full bg-surface-container-low border-outline-variant/50 border rounded-xl px-4 py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                    placeholder="Kosongkan jika tidak ingin mengubah"
                  />
                </div>
                {passwords.newPassword && (
                  <div className="space-y-1 md:col-start-2">
                    <label className="text-label-sm text-on-surface-variant px-1">Konfirmasi Password Baru</label>
                    <input 
                      type="password" 
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      className="w-full bg-surface-container-low border-outline-variant/50 border rounded-xl px-4 py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      placeholder="Ulangi password baru"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Logs (Bottom Bento) - Mock for UI consistency */}
          <div className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-md text-title-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">history</span>
                Aktivitas Terakhir Admin
              </h3>
              <button className="text-primary text-label-md hover:underline">Lihat Semua Log</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 hover:bg-surface-container-low rounded-xl transition-all border border-transparent hover:border-outline-variant/20">
                <div className="bg-secondary-container text-on-secondary-container h-10 w-10 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
                <div className="flex-1">
                  <p className="text-label-md font-bold text-on-surface">Login berhasil ke sistem</p>
                  <p className="text-label-sm text-on-surface-variant">Otentikasi berhasil via dashboard</p>
                </div>
                <div class="text-right">
                  <p className="text-label-sm text-on-surface-variant">Hari ini</p>
                  <p className="text-[10px] text-secondary font-bold uppercase">Sukses</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar Settings (Bento Side) */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          {/* Owner View: System Settings */}
          <div className="glass-card rounded-2xl p-6 shadow-md border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary text-on-primary p-2 rounded-lg">
                <span className="material-symbols-outlined">admin_panel_settings</span>
              </div>
              <h3 className="font-title-md text-title-md text-primary">System Settings</h3>
            </div>
            <div className="space-y-6">
              
              {/* Feature toggle for verified student status */}
              <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant/30">
                <div>
                  <p className="text-label-md font-bold">Status Mahasiswa</p>
                  <p className="text-label-sm text-on-surface-variant">Izin pinjam barang (Mode user)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    className="sr-only peer" 
                    type="checkbox"
                    checked={profileData.isVerified}
                    onChange={(e) => setProfileData({ ...profileData, isVerified: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-label-sm text-on-surface-variant">Global Commission Rate (%)</label>
                <div className="relative">
                  <input 
                    className="w-full bg-surface border-outline-variant/50 border rounded-xl px-4 py-2.5 text-on-surface-variant cursor-not-allowed opacity-70" 
                    type="text" 
                    value="10"
                    disabled
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">%</span>
                </div>
                <p className="text-[10px] text-on-surface-variant">Nilai komisi ditentukan oleh sistem.</p>
              </div>
            </div>
          </div>

          {/* Trust Badge Visual */}
          <div className="bg-gradient-to-br from-secondary-container/30 to-primary-container/10 p-6 rounded-2xl border border-secondary/20 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-secondary mb-2">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                <span className="font-bold text-label-md uppercase tracking-widest">Identitas Terverifikasi</span>
              </div>
              <p className="text-on-surface-variant text-label-sm leading-relaxed">
                Akun admin Anda memiliki akses penuh ke sistem CampusRent. Harap jaga kerahasiaan kredensial login Anda.
              </p>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[100px] text-secondary/5 rotate-12">shield_person</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminProfile;
