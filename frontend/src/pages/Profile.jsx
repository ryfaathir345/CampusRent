import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
        return <div className="flex justify-center py-32 min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="bg-background text-on-surface dot-pattern min-h-screen flex flex-col font-body-md text-body-md">
            <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-stack-lg flex flex-col md:flex-row gap-gutter">
                
                {/* SideNavBar */}
                <aside className="hidden md:flex h-[calc(100vh-120px)] w-64 shrink-0 sticky top-24 border-r border-outline-variant/10 shadow-lg bg-surface-container-low/80 backdrop-blur-xl flex-col gap-stack-md p-gutter z-40 transition-all duration-300 rounded-xl">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-fixed p-0.5 mb-3 bg-white relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                            {photoPreview ? (
                                <img src={photoPreview} alt={user.nama} className="w-full h-full object-cover rounded-full group-hover:opacity-80 transition-opacity" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-primary font-headline-lg text-[32px] group-hover:opacity-80 transition-opacity">
                                    {user.nama.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white">photo_camera</span>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        
                        <h3 className="font-title-md text-title-md text-on-surface text-center line-clamp-1 break-all px-2">{user.nama}</h3>
                        {reputation.isVerified && (
                            <p className="font-label-sm text-label-sm text-primary flex items-center gap-1 mt-1 bg-primary-fixed/30 px-2 py-0.5 rounded-full">
                                <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                                Mahasiswa Terverifikasi
                            </p>
                        )}
                    </div>
                    <nav className="flex flex-col gap-2 flex-1">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-xl font-bold font-label-md text-label-md translate-x-1 duration-300">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>person</span> Profile
                        </Link>
                        <Link to="/transactions" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 rounded-xl transition-all font-label-md text-label-md">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>history</span> History
                        </Link>
                        <Link to="/chat" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 rounded-xl transition-all font-label-md text-label-md">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>mail</span> Messages
                        </Link>
                        <Link to="/wallet" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 rounded-xl transition-all font-label-md text-label-md">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>account_balance_wallet</span> Wallet
                        </Link>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <div className="flex-grow flex flex-col gap-stack-lg min-w-0 pb-32">
                    <div className="space-y-stack-xl">
                        
                        {/* Page Title */}
                        <div className="md:mt-6">
                            <h1 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface mb-2">Pengaturan Profil</h1>
                            <p className="font-body-md text-body-md text-on-surface-variant">Kelola informasi pribadi dan preferensi akun Anda.</p>
                        </div>
                        
                        {/* Bento Grid Layout for Header Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md">
                            
                            {/* Main Profile Summary Card */}
                            <div className="glass-panel rounded-xl p-6 lg:col-span-2 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-sm border border-outline-variant/30">
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl -z-10"></div>
                                <div className="w-32 h-32 rounded-full border-4 border-surface shadow-sm relative flex-shrink-0 z-10 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                                    {photoPreview ? (
                                        <img src={photoPreview} alt={user.nama} className="w-full h-full object-cover rounded-full group-hover:opacity-80 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-primary font-headline-lg text-[48px] group-hover:opacity-80 transition-opacity">
                                            {user.nama.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white">photo_camera</span>
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-primary text-on-primary p-1.5 rounded-full border-2 border-surface shadow-sm flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>camera_alt</span>
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left z-10">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface break-words">{user.nama}</h2>
                                        {reputation.isVerified && (
                                            <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm w-max shadow-sm border border-secondary-fixed">
                                                <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                                                Mahasiswa Terverifikasi
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">{profileData.universitas || 'Universitas Belum Diatur'} • {profileData.jurusan || 'Jurusan'} {user.angkatan}</p>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 flex flex-col items-center">
                                            <span className="font-title-md text-title-md text-primary">{reviews.totalReviews || 0}</span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Ulasan</span>
                                        </div>
                                        <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 flex flex-col items-center">
                                            <span className="font-title-md text-title-md text-primary flex items-center gap-1">
                                                {reviews.avgRating || '0.0'} <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                            </span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Rating</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Trust Score Widget */}
                            <div className="glass-panel rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm border border-outline-variant/30">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-tint/5 via-transparent to-transparent -z-10"></div>
                                <h3 className="font-title-md text-title-md text-on-surface mb-4 w-full text-left flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 0"}}>health_and_safety</span>
                                    Trust Score
                                </h3>
                                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle className="text-surface-container-highest stroke-current" cx="50" cy="50" fill="none" r="45" strokeWidth="8"></circle>
                                        <circle className="text-primary stroke-current drop-shadow-[0_0_8px_rgba(0,74,198,0.4)]" cx="50" cy="50" fill="none" r="45" strokeDasharray={`${(reputation.trustScore / 100) * 282.7}, 282.7`} strokeLinecap="round" strokeWidth="8"></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="font-display-lg text-[32px] font-bold text-on-surface leading-none">{Math.round(reputation.trustScore)}</span>
                                        <span className="font-label-sm text-label-sm text-on-surface-variant">/100</span>
                                    </div>
                                </div>
                                <span className={`px-4 py-1 rounded-full font-label-md text-label-md font-semibold border ${reputation.trustScore >= 90 ? 'bg-secondary/10 text-secondary border-secondary/20' : reputation.trustScore >= 70 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'}`}>
                                    {reputation.trustScore >= 90 ? 'Sangat Baik' : reputation.trustScore >= 70 ? 'Baik' : 'Biasa'}
                                </span>
                            </div>
                        </div>

                        {/* Tabs & Content Area */}
                        <div className="bg-surface rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
                            
                            {/* Tabs Header */}
                            <div className="flex overflow-x-auto border-b border-outline-variant/20 bg-surface-container-lowest scrollbar-hide">
                                <button onClick={() => setActiveTab('biodata')} className={`px-6 py-4 font-label-md text-label-md whitespace-nowrap transition-colors ${activeTab === 'biodata' ? 'font-semibold text-primary border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'}`}>
                                    Biodata
                                </button>
                                <button onClick={() => setActiveTab('verification')} className={`px-6 py-4 font-label-md text-label-md whitespace-nowrap transition-colors ${activeTab === 'verification' ? 'font-semibold text-primary border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'}`}>
                                    Verifikasi Mahasiswa
                                </button>
                                <button onClick={() => setActiveTab('password')} className={`px-6 py-4 font-label-md text-label-md whitespace-nowrap transition-colors ${activeTab === 'password' ? 'font-semibold text-primary border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'}`}>
                                    Keamanan
                                </button>
                                <button onClick={() => setActiveTab('activities')} className={`px-6 py-4 font-label-md text-label-md whitespace-nowrap transition-colors ${activeTab === 'activities' ? 'font-semibold text-primary border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'}`}>
                                    Aktivitas
                                </button>
                                <button onClick={() => setActiveTab('reviews')} className={`px-6 py-4 font-label-md text-label-md whitespace-nowrap transition-colors ${activeTab === 'reviews' ? 'font-semibold text-primary border-b-2 border-primary bg-primary/5' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'}`}>
                                    Ulasan Saya
                                </button>
                            </div>

                            {/* Form Content */}
                            <div className="p-6 md:p-8">
                                
                                {activeTab === 'biodata' && (
                                    <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-3xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="fullName">Nama Lengkap</label>
                                                <input id="fullName" type="text" value={profileData.nama} onChange={e => setProfileData({...profileData, nama: e.target.value})} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-primary focus:ring-1 transition-shadow shadow-sm outline-none" placeholder="Masukkan nama lengkap" required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="whatsapp">Nomor WhatsApp</label>
                                                <div className="relative">
                                                    <input id="whatsapp" type="tel" value={profileData.whatsapp} onChange={e => setProfileData({...profileData, whatsapp: e.target.value})} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-primary focus:ring-1 transition-shadow shadow-sm outline-none" placeholder="08..." />
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">Email Institusi</label>
                                                <div className="relative flex items-center">
                                                    <input id="email" type="email" value={user.email} className="w-full rounded-lg border border-outline-variant/20 bg-surface-container/50 px-4 py-3 font-body-md text-on-surface-variant cursor-not-allowed shadow-sm pr-12 outline-none" readOnly />
                                                    <div className="absolute right-3 flex items-center justify-center text-secondary">
                                                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}} title="Email Terverifikasi">verified</span>
                                                    </div>
                                                </div>
                                                <p className="font-label-sm text-[11px] text-outline mt-1">Email institusi digunakan untuk verifikasi status mahasiswa aktif.</p>
                                            </div>
                                        </div>
                                        
                                        <hr className="border-outline-variant/20 my-8"/>
                                        <h4 className="font-title-md text-title-md text-on-surface mb-4">Informasi Akademik</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="university">Universitas</label>
                                                <input id="university" type="text" value={profileData.universitas} onChange={e => setProfileData({...profileData, universitas: e.target.value})} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-primary focus:ring-1 transition-shadow shadow-sm outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="department">Fakultas / Program Studi</label>
                                                <input id="department" type="text" value={profileData.jurusan} onChange={e => setProfileData({...profileData, jurusan: e.target.value})} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-primary focus:ring-1 transition-shadow shadow-sm outline-none" />
                                            </div>
                                        </div>
                                        
                                        <div className="pt-6 flex justify-end gap-4">
                                            <button type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary/90 shadow-sm transition-all hover:shadow-md transform hover:-translate-y-0.5">
                                                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                                
                                {activeTab === 'biodata' && (
                                    <div className="mt-8 border-t border-outline-variant/20 pt-8">
                                        <h3 className="font-title-md text-title-md text-on-surface mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{fontVariationSettings: "'FILL' 1"}}>military_tech</span>
                                            Pencapaian
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {reputation.badges.length > 0 ? reputation.badges.map((badge, idx) => (
                                                <div key={idx} className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center mb-3">
                                                        <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>workspace_premium</span>
                                                    </div>
                                                    <span className="font-label-md text-label-md font-semibold text-on-surface">{badge}</span>
                                                </div>
                                            )) : (
                                                <div className="bg-surface-container-low border border-outline-variant/20 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center col-span-full opacity-70 py-8">
                                                    <div className="w-12 h-12 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center mb-3">
                                                        <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 0"}}>lock</span>
                                                    </div>
                                                    <span className="font-label-md text-label-md text-on-surface-variant">Belum ada pencapaian</span>
                                                    <span className="font-label-sm text-[11px] text-outline mt-1">Selesaikan transaksi dan dapatkan reputasi baik</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'verification' && (
                                    <div className="max-w-2xl">
                                        {reputation.isVerified ? (
                                            <div className="bg-secondary-container/20 border border-secondary/30 rounded-2xl p-6 md:p-8 text-center flex flex-col items-center">
                                                <div className="w-20 h-20 bg-secondary-container/50 rounded-full flex items-center justify-center text-secondary mb-4 border border-secondary/20">
                                                    <span className="material-symbols-outlined text-[40px]" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-secondary mb-2">Akun Terverifikasi</h3>
                                                <p className="text-on-surface-variant">Anda sudah memiliki akses penuh ke fitur penyewaan CampusRent.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="bg-surface-container-high border border-outline-variant/30 rounded-2xl p-5">
                                                    <div className="flex items-start gap-3">
                                                        <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">info</span>
                                                        <div>
                                                            <h4 className="font-title-md text-[16px] text-on-surface mb-1 font-semibold">Kenapa butuh verifikasi?</h4>
                                                            <p className="font-body-md text-[14px] text-on-surface-variant">Untuk menjaga keamanan platform, peminjaman & penyewaan barang hanya bisa dilakukan oleh mahasiswa yang sudah terverifikasi.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {reputation.ktmUrl ? (
                                                    <div className="bg-tertiary-container/10 border border-tertiary/30 rounded-2xl p-6 text-center flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-tertiary-container/30 rounded-full flex items-center justify-center text-tertiary mb-4">
                                                            <span className="material-symbols-outlined text-[32px]" style={{fontVariationSettings: "'FILL' 1"}}>pending_actions</span>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-tertiary mb-2">KTM Sedang Direview</h3>
                                                        <p className="font-body-md text-[14px] text-on-surface-variant">Mohon tunggu 1x24 jam untuk verifikasi dari tim admin.</p>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={handleKtmUpload} className="space-y-4">
                                                        <label className="block w-full border-2 border-dashed border-outline-variant/50 rounded-2xl p-8 hover:bg-surface-container-low transition-colors cursor-pointer text-center">
                                                            <span className="material-symbols-outlined text-[40px] text-outline mb-2">upload_file</span>
                                                            <span className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">Upload Foto KTM</span>
                                                            <span className="block font-label-sm text-[12px] text-on-surface-variant">Format: JPG, PNG maksimal 2MB</span>
                                                            <input type="file" className="hidden" accept="image/*" onChange={e => setKtmFile(e.target.files[0])} />
                                                        </label>
                                                        {ktmFile && (
                                                            <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between border border-outline-variant/30">
                                                                <span className="truncate text-on-surface text-sm">{ktmFile.name}</span>
                                                                <button type="button" onClick={() => setKtmFile(null)} className="text-error hover:bg-error/10 rounded-full p-1 transition-colors">
                                                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                        <button type="submit" disabled={isSaving || !ktmFile} className="w-full bg-primary hover:bg-primary/90 text-on-primary font-title-md text-[16px] py-3 rounded-lg shadow-md transition-colors font-semibold disabled:opacity-50 flex justify-center items-center">
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
                                        <form onSubmit={handleChangePassword} className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="block font-label-sm text-label-sm text-on-surface-variant">Password Lama</label>
                                                <input type="password" value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-primary focus:ring-1 transition-shadow shadow-sm outline-none" required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block font-label-sm text-label-sm text-on-surface-variant">Password Baru</label>
                                                <input type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-primary focus:ring-1 transition-shadow shadow-sm outline-none" required minLength="6" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block font-label-sm text-label-sm text-on-surface-variant">Konfirmasi Password Baru</label>
                                                <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-primary focus:ring-1 transition-shadow shadow-sm outline-none" required minLength="6" />
                                            </div>
                                            <div className="pt-2">
                                                <button type="submit" disabled={isSaving} className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-on-primary font-title-md text-[16px] font-bold rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2">
                                                    {isSaving ? 'Menyimpan...' : 'Ganti Password'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'activities' && (
                                    <div className="max-w-2xl">
                                        {activities.length === 0 ? (
                                            <div className="text-center py-10">
                                                <span className="material-symbols-outlined text-[48px] text-outline opacity-50 mb-2">history</span>
                                                <p className="text-on-surface-variant">Belum ada aktivitas terekam.</p>
                                            </div>
                                        ) : (
                                            <div className="relative border-l-2 border-outline-variant/30 ml-4 space-y-8 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                                                {activities.map(act => (
                                                    <div key={act.id} className="relative pl-6">
                                                        <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-primary ring-4 ring-surface"></span>
                                                        <p className="font-label-md text-[14px] text-on-surface font-medium">{act.action}</p>
                                                        <p className="font-label-sm text-[12px] text-on-surface-variant mt-1">{new Date(act.createdAt).toLocaleString('id-ID')}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="max-w-3xl">
                                        <div className="flex items-center justify-between mb-stack-md bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                                            <span className="font-title-md text-[16px] text-on-surface font-semibold">Ringkasan Ulasan</span>
                                            <div className="flex items-center gap-2 bg-tertiary-container/10 px-3 py-1.5 rounded-lg border border-tertiary/20">
                                                <span className="material-symbols-outlined text-tertiary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                                <span className="font-title-md text-[18px] font-bold text-tertiary">{reviews.avgRating}</span>
                                                <span className="font-label-sm text-[12px] text-on-surface-variant">({reviews.totalReviews} ulasan)</span>
                                            </div>
                                        </div>

                                        {reviews.reviews.length === 0 ? (
                                            <div className="text-center py-10 border border-dashed border-outline-variant/50 rounded-xl">
                                                <span className="material-symbols-outlined text-[48px] text-outline opacity-50 mb-2">star_rate</span>
                                                <p className="text-on-surface-variant">Belum ada ulasan untuk Anda.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                                                {reviews.reviews.map(rev => (
                                                    <div key={rev.id} className="p-stack-md bg-surface-container-lowest border border-outline-variant/30 shadow-sm rounded-xl hover:border-outline-variant transition-colors">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                                                                    {rev.reviewer.fotoProfil ? <img src={`${UPLOADS_URL}${rev.reviewer.fotoProfil}`} alt="Reviewer" className="w-full h-full object-cover" /> : rev.reviewer.nama.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="font-label-md text-[14px] font-semibold text-on-surface line-clamp-1">{rev.reviewer.nama}</p>
                                                                    <p className="font-label-sm text-[10px] text-on-surface-variant">{new Date(rev.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex text-tertiary">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span key={i} className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: i < rev.rating ? "'FILL' 1" : "'FILL' 0"}}>star</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {rev.item && (
                                                            <div className="inline-flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-md mb-2 border border-outline-variant/20">
                                                                <span className="material-symbols-outlined text-[12px] text-on-surface-variant">inventory_2</span>
                                                                <span className="font-label-sm text-[11px] text-on-surface-variant truncate max-w-[200px]">{rev.item.namaBarang}</span>
                                                            </div>
                                                        )}
                                                        <p className="font-body-md text-[14px] text-on-surface mt-1">{rev.comment || <span className="text-on-surface-variant italic">Tidak ada komentar</span>}</p>
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
            </main>
        </div>
    );
};

export default Profile;
