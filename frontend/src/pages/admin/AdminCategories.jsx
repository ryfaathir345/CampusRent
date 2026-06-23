import React, { useState, useEffect } from 'react';
import categoryService from '../../services/category.service';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('category');
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, itemsRes] = await Promise.all([
        categoryService.getCategories(),
        adminService.getItems()
      ]);
      setCategories(catRes.data);
      setItems(itemsRes.data);
      if (catRes.data.length > 0 && !activeCategoryId) {
        setActiveCategoryId(catRes.data[0].id);
      }
    } catch (err) {
      toast.error('Gagal memuat data kategori');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await categoryService.createCategory({ name: newCatName, icon: newCatIcon, description: '' });
      toast.success('Kategori berhasil ditambahkan');
      setNewCatName('');
      fetchData();
    } catch (error) {
      toast.error('Gagal menambahkan kategori');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Yakin ingin menghapus kategori ini?')) {
      try {
        await categoryService.deleteCategory(id);
        toast.success('Kategori berhasil dihapus');
        if (activeCategoryId === id) setActiveCategoryId(null);
        fetchData();
      } catch (error) {
        toast.error('Gagal menghapus kategori');
      }
    }
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  // Matches category name case insensitively
  const categoryItems = activeCategory ? items.filter(item => item.kategori?.toUpperCase() === activeCategory.name?.toUpperCase()) : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex-1 flex gap-stack-lg h-full">
        {/* Left Panel: Category List */}
        <div className="w-1/3 flex flex-col space-y-stack-md h-full">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Category Taxonomy</h2>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-label-sm">{categories.length} Categories</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {categories.map(cat => {
              const count = items.filter(i => i.kategori?.toUpperCase() === cat.name?.toUpperCase()).length;
              const isActive = activeCategoryId === cat.id;
              
              return (
                <div 
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`glass-card p-stack-md rounded-xl cursor-pointer transition-all ${
                    isActive 
                      ? 'border-2 border-primary ring-4 ring-primary/5 bg-white' 
                      : 'hover:border-primary/40 bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-lg ${isActive ? 'bg-primary-container text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined">{cat.icon || 'category'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-label-sm px-2 py-1 rounded ${isActive ? 'bg-primary/10 text-primary font-bold' : 'bg-surface-container text-on-surface-variant'}`}>
                        {count} Items
                      </span>
                      {!isActive && (
                         <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                          className="text-error hover:bg-error/10 p-1 rounded transition-colors"
                         >
                           <span className="material-symbols-outlined text-[16px]">delete</span>
                         </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-on-surface text-body-lg">{cat.name}</h3>
                  <p className="text-label-sm text-on-surface-variant truncate">{cat.description || 'Category'}</p>
                </div>
              );
            })}
          </div>

          {/* Add New Category Form */}
          <div className="bg-white border border-outline-variant p-stack-md rounded-xl shadow-sm mt-auto shrink-0">
            <h4 className="font-bold text-on-surface mb-3">Add New Category</h4>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button type="button" className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-dashed border-outline-variant text-outline hover:border-primary hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">{newCatIcon}</span>
                  </button>
                </div>
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 rounded-lg border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md outline-none px-3 py-2 border" 
                  placeholder="Category Name" 
                  required
                />
              </div>
              <button type="submit" className="w-full bg-primary text-white py-2 rounded-full font-bold hover:bg-primary/90 transition-all active:scale-[0.98]">
                Create Category
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Items in Selected Category */}
        <div className="w-2/3 flex flex-col space-y-stack-md h-full">
          {activeCategory ? (
            <>
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-outline-variant shadow-sm shrink-0">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">{activeCategory.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="material-symbols-outlined text-outline text-sm">filter_list</span>
                    <span className="text-label-sm text-on-surface-variant">Showing all active rentals and available inventory</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-lg font-bold text-label-md hover:bg-outline-variant transition-colors">Export CSV</button>
                </div>
              </div>

              {/* Items Grid */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {categoryItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
                    <span className="material-symbols-outlined text-5xl mb-2 opacity-50">inventory_2</span>
                    <p>No items in this category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryItems.map(item => (
                      <div key={item.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                        <div className="h-40 relative bg-surface-container">
                          {item.fotoBarang ? (
                            <img src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} alt={item.namaBarang} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                              <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                            </div>
                          )}
                          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            item.isBanned ? 'bg-error-container text-error' : 'bg-tertiary-container text-tertiary'
                          }`}>
                            {item.isBanned ? 'Banned' : item.statusBarang}
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h4 className="font-bold text-on-surface truncate">{item.namaBarang}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-label-sm text-on-surface-variant">Owner: {item.owner?.nama}</span>
                            <span className="font-bold text-primary text-body-md">Rp {item.hargaSewa.toLocaleString('id-ID')}/hari</span>
                          </div>
                          <div className="mt-4 flex space-x-2 mt-auto pt-4 border-t border-outline-variant/30">
                            <button className="flex-1 py-1.5 rounded-lg border border-outline-variant text-label-sm font-bold hover:bg-surface-container-low transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 bg-white rounded-xl border border-outline-variant flex items-center justify-center text-on-surface-variant">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">category</span>
                <p className="font-headline-sm">Select a category</p>
                <p className="text-body-md">Choose a category from the left panel to view its items.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
