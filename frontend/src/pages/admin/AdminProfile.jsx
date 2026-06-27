import { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
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
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await profileService.updateProfile(profileData);
      toast.success('Profil berhasil diperbarui');
      if (res.data && res.data.data) {
        // Keep the same token, but update user data in context
        login(res.data.data, localStorage.getItem('token'));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Konfirmasi password tidak cocok');
    }
    
    setIsSaving(true);
    try {
      await profileService.changePassword({ 
        oldPassword: passwords.oldPassword, 
        newPassword: passwords.newPassword 
      });
      toast.success('Password berhasil diubah');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password');
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
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div></div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Kolom Kiri: Ganti Foto & Password */}
      <div className="flex flex-col gap-6 xl:col-span-1">
        {/* Foto Profil Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-5 font-semibold text-gray-800 dark:text-white/90">
            Foto Profil Admin
          </h3>
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer mb-5" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-sm dark:bg-gray-800">
                {photoPreview ? (
                  <img src={photoPreview} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  user.nama.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={28} />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Klik pada gambar untuk mengunggah foto profil baru. Format JPG, PNG max 5MB.
            </p>
          </div>
        </div>

        {/* Ganti Password Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-5 font-semibold text-gray-800 dark:text-white/90">
            Ganti Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Password Lama
              </label>
              <input
                type="password"
                value={passwords.oldPassword}
                onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Password Baru
              </label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                required
                minLength="6"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                required
                minLength="6"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="mt-2 w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Kolom Kanan: Form Biodata Admin */}
      <div className="xl:col-span-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-5 font-semibold text-gray-800 dark:text-white/90">
            Informasi Personal Admin
          </h3>
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={profileData.nama}
                onChange={(e) => setProfileData({ ...profileData, nama: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none cursor-not-allowed dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">Email tidak dapat diubah</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Nomor WhatsApp
              </label>
              <input
                type="text"
                value={profileData.whatsapp}
                onChange={(e) => setProfileData({ ...profileData, whatsapp: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                placeholder="08..."
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">Status Mahasiswa (Verified)</h4>
                <p className="text-xs text-gray-500">Nyalakan ini jika Admin ingin bertindak sebagai mahasiswa untuk meminjam barang.</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={profileData.isVerified}
                  onChange={(e) => setProfileData({ ...profileData, isVerified: e.target.checked })}
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-brand-800"></div>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
