import React, { useState, useEffect } from 'react';
import categoryService from '../../services/category.service';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../tailadmin/components/ui/table';
import Badge from '../../tailadmin/components/ui/badge/Badge';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const ICON_OPTIONS = [
  'category', 'inventory_2', 'laptop', 'school', 'sports_esports',
  'home', 'kitchen', 'chair', 'watch', 'camera_alt',
  'menu_book', 'hiking', 'sports_soccer', 'music_note', 'palette',
];

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('category');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, itemsRes] = await Promise.all([
        categoryService.getCategories(),
        adminService.getItems()
      ]);
      setCategories(catRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      toast.error('Gagal memuat data kategori');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmitting(true);
    try {
      await categoryService.createCategory({ name: newCatName, icon: newCatIcon, description: newCatDesc });
      toast.success('Kategori berhasil ditambahkan!');
      setNewCatName('');
      setNewCatDesc('');
      setNewCatIcon('category');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error('Gagal menambahkan kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Yakin ingin menghapus kategori "${name}"?`)) {
      try {
        await categoryService.deleteCategory(id);
        toast.success('Kategori berhasil dihapus');
        fetchData();
      } catch (error) {
        toast.error('Gagal menghapus kategori');
      }
    }
  };

  const handleViewItems = (cat) => {
    setSelectedCategory(cat);
    setShowItemsModal(true);
  };

  const getItemCount = (catName) =>
    items.filter(i => i.kategori?.toUpperCase() === catName?.toUpperCase()).length;

  const getCategoryItems = (catName) =>
    items.filter(i => i.kategori?.toUpperCase() === catName?.toUpperCase());

  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = items.length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin h-10 w-10 border-b-2 border-brand-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Category Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and organize all item categories</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-theme-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-brand-50 dark:bg-brand-500/10 rounded-xl mb-5">
            <span className="material-symbols-outlined text-brand-500">category</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Categories</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{categories.length}</h4>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-success-50 dark:bg-success-500/10 rounded-xl mb-5">
            <span className="material-symbols-outlined text-success-500">inventory_2</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Items</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{totalItems}</h4>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-warning-50 dark:bg-warning-500/10 rounded-xl mb-5">
            <span className="material-symbols-outlined text-warning-500">bar_chart</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Avg Items / Category</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {categories.length > 0 ? (totalItems / categories.length).toFixed(1) : '0'}
            </h4>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">All Categories</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{filteredCategories.length} categories found</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all w-56"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Category
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Description
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Items Count
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center" colSpan={5}>
                    <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                      <span className="material-symbols-outlined text-5xl">category</span>
                      <p className="font-medium">No categories found</p>
                      <p className="text-sm">Try adjusting your search or add a new category.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((cat) => {
                  const count = getItemCount(cat.name);
                  return (
                    <TableRow key={cat.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      {/* Category Name & Icon */}
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 shrink-0">
                            <span className="material-symbols-outlined text-brand-500 text-[20px]">
                              {cat.icon || 'category'}
                            </span>
                          </div>
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {cat.name}
                            </span>
                            <span className="block text-gray-400 text-theme-xs dark:text-gray-500">
                              ID: #{cat.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 max-w-[200px]">
                        <span className="truncate block">
                          {cat.description || <span className="italic text-gray-300 dark:text-gray-600">No description</span>}
                        </span>
                      </TableCell>

                      {/* Items Count */}
                      <TableCell className="px-5 py-4 text-start">
                        <button
                          onClick={() => handleViewItems(cat)}
                          className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 hover:underline text-theme-sm font-medium"
                        >
                          <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                          {count} Items
                        </button>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color={count > 0 ? 'success' : 'warning'}>
                          {count > 0 ? 'Active' : 'Empty'}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewItems(cat)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-500/10 hover:bg-error-100 dark:hover:bg-error-500/20 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ADD CATEGORY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Add New Category</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Fill in the details below</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateCategory} className="p-6 space-y-5">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category Name <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Electronics, Sports..."
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short description for this category..."
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCatIcon(icon)}
                      className={`p-3 rounded-xl flex items-center justify-center transition-all border text-sm ${
                        newCatIcon === icon
                          ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-brand-400 hover:text-brand-500'
                      }`}
                      title={icon}
                    >
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Selected: <span className="font-medium text-gray-600 dark:text-gray-300">{newCatIcon}</span></p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newCatName.trim()}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors shadow-theme-xs"
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ITEMS MODAL */}
      {showItemsModal && selectedCategory && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowItemsModal(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10">
                  <span className="material-symbols-outlined text-brand-500">{selectedCategory.icon || 'category'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">{selectedCategory.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getItemCount(selectedCategory.name)} items in this category</p>
                </div>
              </div>
              <button
                onClick={() => setShowItemsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items List */}
            <div className="overflow-y-auto flex-1">
              {getCategoryItems(selectedCategory.name).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                  <span className="material-symbols-outlined text-5xl mb-3">inventory_2</span>
                  <p className="font-medium">No items in this category</p>
                </div>
              ) : (
                <div className="max-w-full overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-start">Item</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-start">Owner</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-start">Price/Day</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-start">Status</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {getCategoryItems(selectedCategory.name).map(item => (
                        <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                          <TableCell className="px-5 py-3 text-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                                {item.fotoBarang ? (
                                  <img
                                    src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`}
                                    alt={item.namaBarang}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-gray-400 text-[18px]">image</span>
                                  </div>
                                )}
                              </div>
                              <span className="font-medium text-gray-800 dark:text-white/90 text-theme-sm truncate max-w-[120px]">
                                {item.namaBarang}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-start">
                            {item.owner?.nama || '-'}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-theme-sm text-start font-medium text-brand-600 dark:text-brand-400">
                            Rp {item.hargaSewa?.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-start">
                            <Badge size="sm" color={item.isBanned ? 'error' : item.statusBarang === 'Tersedia' ? 'success' : 'warning'}>
                              {item.isBanned ? 'Banned' : item.statusBarang}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
