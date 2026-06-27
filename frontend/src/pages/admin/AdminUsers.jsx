import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser } = useAuth();
  
  const isOwner = currentUser?.role === 'OWNER';

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error('Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleSuspend = async (userId) => {
    try {
      await adminService.toggleUserSuspend(userId);
      toast.success('Status pengguna berhasil diubah');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      toast.success(`Berhasil mengubah role menjadi ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah role');
    }
  };

  const toggleExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const filteredUsers = users.filter(u => 
    u.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nim?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = users.filter(u => !u.isSuspended).length;
  const suspendedUsers = users.filter(u => u.isSuspended).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Top Section with Title and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="font-bold text-gray-800 text-title-md dark:text-white/90">Users Management</h2>
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">search</span>
          <input 
            type="text" 
            placeholder="Search by name, email, or NIM..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm text-gray-800 dark:text-white/90 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Dashboard Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex items-center justify-between group hover:shadow-theme-sm transition-all">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Total Users</p>
            <h3 className="text-title-md font-bold text-gray-800 dark:text-white/90 mt-1">{users.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-500 group-hover:text-white transition-colors flex items-center justify-center text-gray-800 dark:text-white/90">
            <span className="material-symbols-outlined text-[24px]">group</span>
          </div>
        </div>
        
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex items-center justify-between group hover:shadow-theme-sm transition-all">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Active Users</p>
            <h3 className="text-title-md font-bold text-gray-800 dark:text-white/90 mt-1">{activeUsers}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-success-500 group-hover:text-white transition-colors flex items-center justify-center text-gray-800 dark:text-white/90">
            <span className="material-symbols-outlined text-[24px]">bolt</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex items-center justify-between group hover:shadow-theme-sm transition-all">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Suspended</p>
            <h3 className="text-title-md font-bold text-gray-800 dark:text-white/90 mt-1">{suspendedUsers}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-error-500 group-hover:text-white transition-colors flex items-center justify-center text-gray-800 dark:text-white/90">
            <span className="material-symbols-outlined text-[24px]">block</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <section className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="w-12 px-6 py-4"></th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NIM</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">No users found</td>
                </tr>
              ) : filteredUsers.map(u => (
                <React.Fragment key={u.id}>
                  <tr className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => toggleExpand(u.id)}>
                    <td className="px-6 py-4">
                      <button className="p-1 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-full transition-all text-brand-500">
                        <span 
                          className="material-symbols-outlined transition-transform duration-300" 
                          style={{ transform: expandedUser === u.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                          expand_more
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                          {u.nama ? u.nama.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{u.nama}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{u.nim || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{u.jurusan || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 items-center">
                        {u.isSuspended ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-500">Suspended</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500">Active</span>
                        )}
                        {u.role === 'ADMIN' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                            🛡️ Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 flex-wrap max-w-[150px] ml-auto">
                        {isOwner && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUpdateRole(u.id, u.role === 'ADMIN' ? 'MAHASISWA' : 'ADMIN'); }}
                            className={`px-3 py-1 border rounded-full text-[10px] font-bold transition-colors ${
                              u.role === 'ADMIN'
                                ? 'border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-500/30 dark:text-orange-500 dark:hover:bg-orange-500/10'
                                : 'border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-400 dark:hover:bg-purple-500/10'
                            }`}
                          >
                            {u.role === 'ADMIN' ? 'Hapus Admin' : 'Jadikan Admin'}
                          </button>
                        )}
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleSuspend(u.id); }}
                          className={`px-3 py-1 border rounded-full text-[10px] font-bold transition-colors ${
                            u.isSuspended 
                              ? 'border-success-200 text-success-600 hover:bg-success-50 dark:border-success-500/30 dark:text-success-500 dark:hover:bg-success-500/10' 
                              : 'border-error-200 text-error-600 hover:bg-error-50 dark:border-error-500/30 dark:text-error-500 dark:hover:bg-error-500/10'
                          }`}
                        >
                          {u.isSuspended ? 'Restore' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expandable Content for Items Owned */}
                  {expandedUser === u.id && (
                    <tr className="bg-gray-50/50 dark:bg-gray-800/20">
                      <td className="px-6 py-0 overflow-hidden" colSpan="6">
                        <div className="py-4 border-l-2 border-brand-500 ml-6 pl-6 my-4">
                          <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-500 text-sm">inventory</span>
                            Items Owned ({u.items?.length || 0})
                          </h4>
                          
                          {u.items && u.items.length > 0 ? (
                            <table className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                              <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                  <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-left">Item Name</th>
                                  <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-left">Category</th>
                                  <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-left">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {u.items.map(item => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-3">
                                      <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                                        {item.fotoBarang && <img src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} alt="" className="w-full h-full object-cover" />}
                                      </div>
                                      {item.namaBarang}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.kategori}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                        item.statusBarang === 'TERSEDIA' 
                                        ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500' 
                                        : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                                      }`}>
                                        {item.statusBarang}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic text-sm">This user has not listed any items for rent yet.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminUsers;
