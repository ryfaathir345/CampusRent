import { useState, useEffect, useRef } from 'react';
import promoService from '../../services/promo.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const AdminPromos = () => {
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountPercent: 10,
    maxDiscount: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setIsLoading(true);
    try {
      const res = await promoService.getPromos();
      setPromos(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Gagal memuat daftar promo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        title: promo.title,
        description: promo.description || '',
        discountPercent: promo.discountPercent,
        maxDiscount: promo.maxDiscount || '',
        startDate: promo.startDate.split('T')[0],
        endDate: promo.endDate.split('T')[0],
        isActive: promo.isActive,
      });
      setBannerPreview(promo.bannerImage ? `${UPLOADS_URL}${promo.bannerImage}` : null);
    } else {
      setEditingPromo(null);
      setFormData({
        code: '',
        title: '',
        description: '',
        discountPercent: 10,
        maxDiscount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isActive: true,
      });
      setBannerPreview(null);
    }
    setBannerFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPromo(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (bannerFile) {
        data.append('bannerImage', bannerFile);
      }

      if (editingPromo) {
        await promoService.updatePromo(editingPromo.id, data);
        toast.success('Promo berhasil diperbarui');
      } else {
        await promoService.createPromo(data);
        toast.success('Promo berhasil dibuat');
      }
      handleCloseModal();
      fetchPromos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan promo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus promo ini?')) {
      try {
        await promoService.deletePromo(id);
        toast.success('Promo berhasil dihapus');
        fetchPromos();
      } catch (err) {
        toast.error('Gagal menghapus promo');
      }
    }
  };

  const handleToggleActive = async (promo) => {
    try {
      const data = new FormData();
      data.append('code', promo.code);
      data.append('title', promo.title);
      data.append('discountPercent', promo.discountPercent);
      data.append('startDate', promo.startDate);
      data.append('endDate', promo.endDate);
      data.append('isActive', !promo.isActive);
      
      await promoService.updatePromo(promo.id, data);
      toast.success(promo.isActive ? 'Promo dinonaktifkan' : 'Promo diaktifkan');
      fetchPromos();
    } catch (err) {
      toast.error('Gagal mengubah status promo');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center bg-surface-container p-6 rounded-3xl shadow-sm border border-outline-variant/20">
        <div>
          <h1 className="font-display-md text-2xl text-on-surface font-extrabold mb-1">Manajemen Promo</h1>
          <p className="font-body-md text-on-surface-variant">Kelola kode diskon dan banner promosi</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-on-primary font-title-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-[20px]">add</span> Tambah Promo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.length === 0 ? (
          <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container-low rounded-3xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-50">loyalty</span>
            <p className="font-title-md">Belum ada promo</p>
            <p className="font-body-md text-sm mt-1">Buat promo pertama Anda untuk menarik penyewa</p>
          </div>
        ) : (
          promos.map(promo => (
            <div key={promo.id} className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30 flex flex-col group hover:shadow-md transition-all">
              <div className="h-40 bg-surface-variant relative overflow-hidden">
                {promo.bannerImage ? (
                  <img src={`${UPLOADS_URL}${promo.bannerImage}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Banner" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline font-title-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                    <span className="material-symbols-outlined text-4xl opacity-50">image</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur-md ${promo.isActive ? 'bg-primary/90 text-on-primary' : 'bg-surface-variant/90 text-on-surface-variant border border-outline-variant'}`}>
                    {promo.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-4 flex-grow">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-title-lg text-on-surface font-bold line-clamp-1">{promo.title}</h3>
                    <span className="shrink-0 bg-tertiary-container text-on-tertiary-container text-xs font-bold px-2 py-0.5 rounded border border-tertiary-container/50">{promo.code}</span>
                  </div>
                  <p className="font-body-md text-sm text-on-surface-variant line-clamp-2 min-h-[40px]">{promo.description || 'Tidak ada deskripsi'}</p>
                </div>
                
                <div className="flex flex-col gap-2 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20">
                  <div className="flex justify-between font-label-md text-sm">
                    <span className="text-on-surface-variant">Diskon</span>
                    <span className="font-bold text-primary">{promo.discountPercent}% {promo.maxDiscount && `(Max: Rp${promo.maxDiscount.toLocaleString()})`}</span>
                  </div>
                  <div className="flex justify-between font-label-md text-sm">
                    <span className="text-on-surface-variant">Periode</span>
                    <span className="font-bold text-on-surface text-xs">{new Date(promo.startDate).toLocaleDateString('id-ID')} - {new Date(promo.endDate).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-outline-variant/20 flex justify-between bg-surface-container-low/50">
                <button 
                  onClick={() => handleToggleActive(promo)}
                  className={`text-sm font-label-md flex items-center gap-1 transition-colors ${promo.isActive ? 'text-error hover:text-error/80' : 'text-primary hover:text-primary/80'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{promo.isActive ? 'block' : 'check_circle'}</span>
                  {promo.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <div className="flex gap-3">
                  <button onClick={() => handleOpenModal(promo)} className="text-on-surface-variant hover:text-primary transition-colors" title="Edit">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(promo.id)} className="text-on-surface-variant hover:text-error transition-colors" title="Hapus">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-background/50 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-2xl rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-8 py-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low shrink-0">
              <h3 className="font-display-md text-xl text-on-surface font-bold">
                {editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}
              </h3>
              <button className="text-on-surface-variant hover:bg-surface-variant p-2 rounded-full transition-colors" onClick={handleCloseModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-sm font-bold text-on-surface-variant">Kode Promo *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full rounded-xl border-outline-variant/30 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md px-4 py-2.5 shadow-sm uppercase" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s/g, '')})}
                    placeholder="MABACAMPUS24"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-sm font-bold text-on-surface-variant">Judul Promo *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full rounded-xl border-outline-variant/30 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md px-4 py-2.5 shadow-sm" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Diskon 50% Pinjaman Pertamamu"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-md text-sm font-bold text-on-surface-variant">Deskripsi</label>
                <textarea 
                  className="w-full rounded-xl border-outline-variant/30 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md px-4 py-2.5 shadow-sm resize-none h-20" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Deskripsi singkat mengenai promo..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-sm font-bold text-on-surface-variant">Diskon (%) *</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      required
                      min="1"
                      max="100"
                      className="w-full rounded-xl border-outline-variant/30 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md px-4 py-2.5 shadow-sm pr-10" 
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({...formData, discountPercent: e.target.value})}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">%</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-sm font-bold text-on-surface-variant">Maksimal Diskon (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">Rp</span>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full rounded-xl border-outline-variant/30 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md pl-12 pr-4 py-2.5 shadow-sm" 
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                      placeholder="Kosongkan jika tanpa batas"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-sm font-bold text-on-surface-variant">Tanggal Mulai *</label>
                  <input 
                    type="date" 
                    required
                    min={!editingPromo ? new Date().toISOString().split('T')[0] : undefined}
                    className="w-full rounded-xl border-outline-variant/30 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md px-4 py-2.5 shadow-sm cursor-pointer" 
                    value={formData.startDate}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    onKeyDown={(e) => e.preventDefault()}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-sm font-bold text-on-surface-variant">Tanggal Berakhir *</label>
                  <input 
                    type="date" 
                    required
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border-outline-variant/30 bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md px-4 py-2.5 shadow-sm cursor-pointer" 
                    value={formData.endDate}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    onKeyDown={(e) => e.preventDefault()}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-md text-sm font-bold text-on-surface-variant">Gambar Banner (Opsional)</label>
                <div 
                  className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 overflow-hidden cursor-pointer transition-colors relative ${bannerPreview ? 'border-primary/50 bg-primary/5 h-48' : 'border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container-low h-32'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {bannerPreview ? (
                    <>
                      <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-background/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-surface text-on-surface font-title-sm px-4 py-2 rounded-lg shadow-md font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">edit</span> Ganti Gambar
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-70">add_photo_alternate</span>
                      <span className="font-title-sm text-on-surface-variant">Klik untuk unggah banner</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              
              <label className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <div>
                  <span className="font-title-sm text-on-surface block font-bold">Promo Aktif</span>
                  <span className="font-body-md text-sm text-on-surface-variant block">Jika dihilangkan centangnya, promo tidak bisa digunakan.</span>
                </div>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 mt-2 shrink-0">
                <button type="button" className="px-6 py-2.5 font-title-md font-bold text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors" onClick={handleCloseModal}>Batal</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 font-title-md font-bold bg-primary hover:bg-primary/90 text-on-primary rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50">
                  {isSaving ? 'Menyimpan...' : 'Simpan Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromos;
