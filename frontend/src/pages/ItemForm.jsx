// src/pages/ItemForm.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Upload, Loader2, MapPin, X } from 'lucide-react';
import itemService from '../services/item.service';
import categoryService from '../services/category.service';
import toast from 'react-hot-toast';

const ItemForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    namaBarang: '',
    kategori: 'ELEKTRONIK',
    deskripsi: '',
    kondisiBarang: '',
    lokasiPengambilan: '',
    maksimalHariPinjam: 1,
    hargaSewa: 0,
    stok: 1,
    statusBarang: 'TERSEDIA',
    latitude: '',
    longitude: ''
  });
  
  const [files, setFiles] = useState([]); // New File objects
  const [existingPhotos, setExistingPhotos] = useState([]); // Array of photo paths (strings) from backend
  const [previews, setPreviews] = useState([]); // Local Object URLs for new files
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const catRes = await categoryService.getCategories();
        setCategories(catRes.data);
        if (catRes.data.length > 0 && !isEdit) {
          setForm(prev => ({ ...prev, kategori: catRes.data[0].name }));
        }

        if (isEdit) {
          const res = await itemService.getItemById(id);
          const item = res.data;
          setForm({
            namaBarang: item.namaBarang,
            kategori: item.kategori,
            deskripsi: item.deskripsi,
            kondisiBarang: item.kondisiBarang,
            lokasiPengambilan: item.lokasiPengambilan,
            maksimalHariPinjam: item.maksimalHariPinjam,
            hargaSewa: item.hargaSewa,
            stok: item.stok || 1,
            statusBarang: item.statusBarang,
            latitude: item.latitude || '',
            longitude: item.longitude || ''
          });
          if (item.fotoBarang) {
            const urls = item.fotoBarang.split(',');
            setExistingPhotos(urls);
          }
        }
      } catch (err) {
        toast.error('Gagal mengambil data');
        if (isEdit) navigate('/my-items');
      } finally {
        setIsFetching(false);
      }
    };
    
    loadInitialData();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolokasi tidak didukung oleh browser Anda');
      return;
    }
    
    toast.loading('Mendapatkan lokasi...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        toast.success('Lokasi berhasil didapatkan', { id: 'geo' });
      },
      (error) => {
        toast.error('Gagal mendapatkan lokasi. Pastikan izin GPS diberikan.', { id: 'geo' });
      }
    );
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (existingPhotos.length + files.length + selectedFiles.length > 5) {
      toast.error('Maksimal 5 foto barang secara keseluruhan');
      return;
    }
    
    // Validate size
    for (let f of selectedFiles) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error('Ukuran masing-masing foto maksimal 5MB');
        return;
      }
    }
    
    setFiles(prev => [...prev, ...selectedFiles]);
    setPreviews(prev => [...prev, ...selectedFiles.map(f => URL.createObjectURL(f))]);
  };

  const handleRemoveExistingPhoto = (index) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });
      if (isEdit) {
        existingPhotos.forEach(photo => {
          formData.append('existingPhotos[]', photo);
        });
        if (existingPhotos.length === 0) {
          formData.append('photosCleared', 'true');
        }
      }

      if (files && files.length > 0) {
        files.forEach(f => formData.append('fotoBarang', f));
      }

      if (isEdit) {
        await itemService.updateItem(id, formData);
        toast.success('Barang berhasil diperbarui');
      } else {
        await itemService.createItem(formData);
        toast.success('Barang berhasil ditambahkan');
      }
      navigate('/my-items');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center py-32 bg-gray-50 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/my-items" className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-blue-600 transition-colors mb-6 font-medium">
          <ChevronLeft size={20} />
          Kembali ke Barang Saya
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">
            {isEdit ? 'Edit Barang' : 'Tambah Barang Baru'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Foto Barang */}
            <div>
              <label className="form-label block mb-2 dark:text-slate-300">Foto Barang</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors relative overflow-hidden"
              >
                {existingPhotos.length > 0 || previews.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto p-4 w-full h-full items-center">
                    {/* Render Existing Photos */}
                    {existingPhotos.map((p, idx) => (
                      <div key={`existing-${idx}`} className="relative h-full shrink-0 group">
                        <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${p}`} alt={`Existing ${idx}`} className="h-full w-auto object-cover rounded-xl shadow-sm border border-slate-200 dark:border-slate-700" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveExistingPhoto(idx); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {/* Render New Previews */}
                    {previews.map((p, idx) => (
                      <div key={`new-${idx}`} className="relative h-full shrink-0 group">
                        <img src={p} alt={`New Preview ${idx}`} className="h-full w-auto object-cover rounded-xl shadow-sm border border-slate-200 dark:border-slate-700" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveNewFile(idx); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {existingPhotos.length + previews.length < 5 && (
                      <div className="h-full shrink-0 aspect-square border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl flex items-center justify-center hover:border-blue-500 hover:bg-blue-50/50 transition-colors text-gray-400">
                        <Upload size={24} />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Upload className="text-gray-400 dark:text-slate-500 mb-2" size={32} />
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Klik untuk upload foto (Max 5)</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">PNG, JPG up to 2MB per file</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                multiple
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Barang */}
              <div className="md:col-span-2">
                <label className="form-label">Nama Barang *</label>
                <input 
                  type="text" 
                  name="namaBarang" 
                  required 
                  value={form.namaBarang} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="Contoh: Kamera Canon DSLR EOS 3000D"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="form-label">Kategori *</label>
                <select 
                  name="kategori" 
                  value={form.kategori} 
                  onChange={handleChange} 
                  className="form-input appearance-none"
                >
                  {categories.map(k => (
                    <option key={k.id} value={k.name}>{k.name.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              {/* Kondisi */}
              <div>
                <label className="form-label">Kondisi Barang *</label>
                <input 
                  type="text" 
                  name="kondisiBarang" 
                  required 
                  value={form.kondisiBarang} 
                  onChange={handleChange} 
                  className="form-input" 
                  placeholder="Contoh: Mulus 90%, Baterai aman"
                />
              </div>

              {/* Lokasi */}
              <div className="md:col-span-2">
                <label className="form-label">Lokasi Pengambilan *</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="lokasiPengambilan" 
                    required 
                    value={form.lokasiPengambilan} 
                    onChange={handleChange} 
                    className="form-input flex-1" 
                    placeholder="Contoh: Gedung Fakultas Teknik, Kantin"
                  />
                  <button 
                    type="button"
                    onClick={handleGetLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                  >
                    <MapPin size={18} />
                    <span className="hidden sm:inline">Gunakan Lokasi Saat Ini</span>
                  </button>
                </div>
                {form.latitude && form.longitude && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                    <MapPin size={12} /> Koordinat tersimpan: {form.latitude}, {form.longitude}
                  </p>
                )}
              </div>

              {/* Maks Hari */}
              <div>
                <label className="form-label">Maksimal Hari Pinjam *</label>
                <input 
                  type="number" 
                  name="maksimalHariPinjam" 
                  required 
                  min="1"
                  value={form.maksimalHariPinjam} 
                  onChange={handleChange} 
                  onWheel={(e) => e.target.blur()}
                  className="form-input" 
                />
              </div>

              {/* Stok Barang */}
              <div>
                <label className="form-label">Stok Barang *</label>
                <input 
                  type="number" 
                  name="stok" 
                  required 
                  min="1"
                  value={form.stok} 
                  onChange={handleChange} 
                  onWheel={(e) => e.target.blur()}
                  className="form-input" 
                />
              </div>

              {/* Harga Sewa */}
              <div>
                <label className="form-label">Harga Sewa per Hari (Rp) *</label>
                <input 
                  type="number" 
                  name="hargaSewa" 
                  required 
                  min="0"
                  value={form.hargaSewa} 
                  onChange={handleChange} 
                  onWheel={(e) => e.target.blur()}
                  className="form-input" 
                  placeholder="Isi 0 jika gratis dipinjamkan"
                />
              </div>

              {/* Status */}
              {isEdit && (
                <div>
                  <label className="form-label">Status Barang</label>
                  <select 
                    name="statusBarang" 
                    value={form.statusBarang} 
                    onChange={handleChange} 
                    className="form-input appearance-none"
                  >
                    <option value="TERSEDIA">TERSEDIA</option>
                    <option value="DIPINJAM">DIPINJAM</option>
                    <option value="TIDAK_TERSEDIA">TIDAK TERSEDIA</option>
                  </select>
                </div>
              )}

              {/* Deskripsi */}
              <div className="md:col-span-2">
                <label className="form-label">Deskripsi Lengkap *</label>
                <textarea 
                  name="deskripsi" 
                  required 
                  rows="4"
                  value={form.deskripsi} 
                  onChange={handleChange} 
                  className="form-input resize-none py-3" 
                  placeholder="Jelaskan spesifikasi, kelengkapan, atau syarat peminjaman..."
                ></textarea>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700">
              <Link to="/my-items" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                Batal
              </Link>
              <button type="submit" disabled={isLoading} className="btn-primary py-2.5 px-8">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Barang'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ItemForm;
