// src/pages/Profile.jsx
import { useState, useEffect, useRef } from 'react';
import { User, Lock, Activity, Star, Camera, Check, AlertCircle, ShieldCheck, BadgeCheck, FileCheck, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import profileService from '../services/profile.service';
import reviewService from '../services/review.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('biodata');
  
  const [profileData, setProfileData] = useState({ nama: '', jurusan: '', universitas: '', whatsapp: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [activities, setActivities] = useState([]);
  const [reviews, setReviews] = useState({ avgRating: 0, totalReviews: 0, reviews: [] });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [reputation, setReputation] = useState({ trustScore: 0, returnPercentage: 0, badges: [], isVerified: false, ktmUrl: null });
  const [ktmFile, setKtmFile] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, actRes, revRes] = await Promise.all([
          profileService.getProfile(),
          profileService.getActivities(),
          reviewService.getUserReviews(user.id)
        ]);
        
        setProfileData({
          nama: profRes.data.nama || '',
          jurusan: profRes.data.jurusan || '',
          universitas: profRes.data.universitas || '',
          whatsapp: profRes.data.whatsapp || ''
        });
        setPhotoPreview(profRes.data.fotoProfil ? `${UPLOADS_URL}${profRes.data.fotoProfil}` : null);
        setReputation({
          trustScore: profRes.data.trustScore || 0,
          returnPercentage: profRes.data.returnPercentage || 0,
          badges: profRes.data.badges || [],
          isVerified: profRes.data.isVerified || false,
          ktmUrl: profRes.data.ktmUrl || null
        });
        
        setActivities(actRes.data);
        setReviews(revRes.data);
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
      await profileService.updateProfile(profileData);
      toast.success('Profil berhasil diperbarui');
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

  const handleKtmUpload = async (e) => {
    e.preventDefault();
    if (!ktmFile) return toast.error('Pilih foto KTM terlebih dahulu');
    if (ktmFile.size > 5 * 1024 * 1024) return toast.error('Ukuran maksimal 5MB');

    setIsSaving(true);
    const formData = new FormData();
    formData.append('ktmUrl', ktmFile);
    try {
      const res = await profileService.updateKtm(formData);
      setReputation(prev => ({ ...prev, ktmUrl: res.data.ktmUrl }));
      setKtmFile(null);
      toast.success('KTM berhasil diunggah, menunggu verifikasi Admin');
    } catch (err) {
      toast.error('Gagal mengunggah KTM');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const TABS = [
    { id: 'biodata', label: 'Biodata', icon: User },
    { id: 'verification', label: 'Verifikasi Mahasiswa', icon: ShieldCheck },
    { id: 'password', label: 'Keamanan', icon: Lock },
    { id: 'activities', label: 'Aktivitas', icon: Activity },
    { id: 'reviews', label: 'Ulasan Saya', icon: Star },
  ];

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-8">Profil Saya</h1>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-gray-50/50 dark:bg-slate-900/50 border-r border-gray-100 dark:border-slate-700 p-6 flex flex-col gap-2">
            
            {/* Avatar preview */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group cursor-pointer mb-3" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-sm">
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.nama.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
              <h3 className="font-bold text-gray-900 dark:text-slate-100 text-center truncate w-full px-2 flex items-center justify-center gap-1" title={user.nama}>
                {user.nama}
                {reputation.isVerified && <BadgeCheck size={16} className="text-blue-500" title="Terverifikasi" />}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 text-center truncate w-full px-2" title={user.email}>{user.email}</p>
            </div>

            {/* Trust Score & Badges */}
            <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Trust Score</span>
                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded-md">
                  <Star size={12} className="fill-current" />
                  <span className="text-xs font-bold">{reputation.trustScore.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {reputation.badges.map((badge, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md flex items-center gap-1 border border-blue-100 dark:border-blue-800">
                    <Check size={10} /> {badge}
                  </span>
                ))}
                {reputation.badges.length === 0 && (
                  <span className="text-xs text-gray-400 italic">Belum ada badge</span>
                )}
              </div>
            </div>

            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50'}`}
                >
                  <Icon size={18} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8">
            
            {activeTab === 'biodata' && (
              <div className="max-w-md">
                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Edit Biodata</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                    <input type="text" value={profileData.nama} onChange={e => setProfileData({...profileData, nama: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Jurusan</label>
                    <input type="text" value={profileData.jurusan} onChange={e => setProfileData({...profileData, jurusan: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Universitas</label>
                    <input type="text" value={profileData.universitas} onChange={e => setProfileData({...profileData, universitas: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white outline-none" placeholder="Misal: Universitas Indonesia" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nomor WhatsApp</label>
                    <input type="text" value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white outline-none" placeholder="08..." />
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl w-full transition-colors flex justify-center">
                      {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="max-w-md">
                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Verifikasi Mahasiswa</h2>
                {reputation.isVerified ? (
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                      <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-green-800 dark:text-green-400 mb-2">Akun Terverifikasi</h3>
                    <p className="text-sm text-green-700 dark:text-green-500">Anda sudah memiliki akses penuh ke CampusRent.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 rounded-2xl p-5">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Kenapa butuh verifikasi?</h4>
                          <p className="text-sm text-gray-600 dark:text-slate-400">Untuk menjaga keamanan platform, peminjaman & penyewaan barang hanya bisa dilakukan oleh mahasiswa yang sudah terverifikasi.</p>
                        </div>
                      </div>
                    </div>

                    {reputation.ktmUrl ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-4">
                          <FileCheck size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-500 mb-2">KTM Sedang Direview</h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-600">Mohon tunggu 1x24 jam untuk verifikasi dari tim admin.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleKtmUpload} className="space-y-4">
                        <label className="block w-full border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl p-8 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer text-center">
                          <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                          <span className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Upload Foto KTM</span>
                          <span className="block text-xs text-gray-500 dark:text-slate-400">Format: JPG, PNG maksimal 2MB</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => setKtmFile(e.target.files[0])} />
                        </label>
                        {ktmFile && (
                          <div className="bg-gray-100 dark:bg-slate-700 rounded-xl p-3 flex items-center justify-between text-sm">
                            <span className="truncate text-gray-700 dark:text-slate-300">{ktmFile.name}</span>
                            <button type="button" onClick={() => setKtmFile(null)} className="text-red-500 hover:text-red-600 font-bold px-2">X</button>
                          </div>
                        )}
                        <button type="submit" disabled={isSaving || !ktmFile} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl w-full transition-colors flex justify-center disabled:opacity-50">
                          {isSaving ? 'Mengunggah...' : 'Kirim Verifikasi'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'password' && (
              <div className="max-w-md">
                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Ganti Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password Lama</label>
                    <input type="password" value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password Baru</label>
                    <input type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white outline-none" required minLength="6" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Konfirmasi Password Baru</label>
                    <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white outline-none" required minLength="6" />
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl w-full transition-colors flex justify-center">
                      {isSaving ? 'Menyimpan...' : 'Ganti Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'activities' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Riwayat Aktivitas</h2>
                {activities.length === 0 ? (
                  <p className="text-gray-500 dark:text-slate-400">Belum ada aktivitas terekam.</p>
                ) : (
                  <div className="relative border-l border-gray-200 dark:border-slate-700 ml-3 space-y-8 max-h-[400px] overflow-y-auto pr-4">
                    {activities.map(act => (
                      <div key={act.id} className="relative pl-6">
                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-800"></span>
                        <p className="font-medium text-gray-900 dark:text-slate-100 text-sm">{act.action}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{new Date(act.createdAt).toLocaleString('id-ID')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Ulasan Tentang Saya</h2>
                  <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1.5 rounded-lg border border-yellow-100 dark:border-yellow-800/50">
                    <Star className="text-yellow-500 fill-current" size={20} />
                    <span className="font-bold text-yellow-700 dark:text-yellow-500">{reviews.avgRating}</span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-600">({reviews.totalReviews} ulasan)</span>
                  </div>
                </div>

                {reviews.reviews.length === 0 ? (
                  <div className="text-center p-10 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <Star className="mx-auto text-gray-300 dark:text-slate-600 mb-2" size={32} />
                    <p className="text-gray-500 dark:text-slate-400">Belum ada ulasan untuk Anda.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {reviews.reviews.map(rev => (
                      <div key={rev.id} className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden text-xs">
                              {rev.reviewer.fotoProfil ? <img src={`${UPLOADS_URL}${rev.reviewer.fotoProfil}`} className="w-full h-full object-cover" /> : rev.reviewer.nama.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{rev.reviewer.nama}</p>
                          </div>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < rev.rating ? 'fill-current' : 'text-gray-200 dark:text-slate-600'} />
                            ))}
                          </div>
                        </div>
                        {rev.item && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2 bg-blue-50 dark:bg-blue-900/30 w-fit px-2 py-0.5 rounded-md">
                            Transaksi: {rev.item.namaBarang}
                          </p>
                        )}
                        <p className="text-gray-700 dark:text-slate-300 text-sm">{rev.comment || <span className="text-gray-400 italic">Tidak ada komentar</span>}</p>
                        <p className="text-xs text-gray-400 mt-3">{new Date(rev.createdAt).toLocaleDateString('id-ID')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
