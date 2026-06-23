import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="animate-fade-in space-y-stack-lg">
      
      {/* Top Section with Title and Search (Since Header is shared, we put page title here) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="font-headline-sm text-headline-sm text-primary">Users Management</h2>
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
          <input 
            type="text" 
            placeholder="Search by name, email, or NIM..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md"
          />
        </div>
      </div>

      {/* Dashboard Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-white p-stack-lg rounded-xl card-shadow border border-outline-variant flex items-center justify-between">
          <div>
            <p className="text-label-sm text-on-surface-variant font-label-sm uppercase tracking-wider">Total Users</p>
            <h3 className="text-headline-md font-headline-md mt-1">{users.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">group</span>
          </div>
        </div>
        
        <div className="bg-white p-stack-lg rounded-xl card-shadow border border-outline-variant flex items-center justify-between">
          <div>
            <p className="text-label-sm text-on-surface-variant font-label-sm uppercase tracking-wider">Active Users</p>
            <h3 className="text-headline-md font-headline-md mt-1">{activeUsers}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-tertiary-fixed-dim/30 flex items-center justify-center text-tertiary-container">
            <span className="material-symbols-outlined">bolt</span>
          </div>
        </div>

        <div className="bg-white p-stack-lg rounded-xl card-shadow border border-outline-variant flex items-center justify-between">
          <div>
            <p className="text-label-sm text-on-surface-variant font-label-sm uppercase tracking-wider">Suspended</p>
            <h3 className="text-headline-md font-headline-md mt-1">{suspendedUsers}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
            <span className="material-symbols-outlined">block</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <section className="bg-white rounded-xl border border-outline-variant card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="w-12 px-gutter py-4"></th>
                <th className="px-gutter py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">User</th>
                <th className="px-gutter py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">NIM</th>
                <th className="px-gutter py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Department</th>
                <th className="px-gutter py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-gutter py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-on-surface-variant">No users found</td>
                </tr>
              ) : filteredUsers.map(u => (
                <React.Fragment key={u.id}>
                  <tr className="group hover:bg-surface-container transition-colors cursor-pointer" onClick={() => toggleExpand(u.id)}>
                    <td className="px-gutter py-4">
                      <button className="p-1 hover:bg-primary/10 rounded-full transition-all text-primary">
                        <span 
                          className="material-symbols-outlined transition-transform duration-300" 
                          style={{ transform: expandedUser === u.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                          expand_more
                        </span>
                      </button>
                    </td>
                    <td className="px-gutter py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold">
                          {u.nama ? u.nama.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-body-md text-body-md font-bold text-on-surface">{u.nama}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-gutter py-4 font-body-md text-body-md text-on-surface">{u.nim || '-'}</td>
                    <td className="px-gutter py-4 font-body-md text-body-md text-on-surface">{u.jurusan || '-'}</td>
                    <td className="px-gutter py-4">
                      {u.isSuspended ? (
                        <span className="status-chip bg-error-container text-on-error-container">Suspended</span>
                      ) : (
                        <span className="status-chip bg-tertiary-fixed-dim/30 text-tertiary-container">Active</span>
                      )}
                    </td>
                    <td className="px-gutter py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleSuspend(u.id); }}
                          className={`px-4 py-1.5 border rounded-full font-label-sm text-label-sm transition-colors ${
                            u.isSuspended 
                              ? 'border-tertiary text-tertiary hover:bg-tertiary/5' 
                              : 'border-error text-error hover:bg-error/5'
                          }`}
                        >
                          {u.isSuspended ? 'Restore' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expandable Content for Items Owned */}
                  {expandedUser === u.id && (
                    <tr className="bg-surface-container-low/50">
                      <td className="px-gutter py-0 overflow-hidden" colSpan="6">
                        <div className="py-stack-lg border-l-4 border-primary ml-6 pl-gutter my-4">
                          <h4 className="font-label-md text-label-md text-on-surface mb-stack-md flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">inventory</span>
                            Items Owned ({u.items?.length || 0})
                          </h4>
                          
                          {u.items && u.items.length > 0 ? (
                            <table className="w-full bg-white rounded-xl border border-outline-variant overflow-hidden">
                              <thead className="bg-surface-variant/20">
                                <tr>
                                  <th className="px-4 py-2 text-label-sm font-label-sm text-on-surface-variant text-left">Item Name</th>
                                  <th className="px-4 py-2 text-label-sm font-label-sm text-on-surface-variant text-left">Category</th>
                                  <th className="px-4 py-2 text-label-sm font-label-sm text-on-surface-variant text-left">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-outline-variant/30">
                                {u.items.map(item => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-3 text-body-md flex items-center gap-2">
                                      <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0">
                                        {item.fotoBarang && <img src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} alt="" className="w-full h-full object-cover" />}
                                      </div>
                                      {item.namaBarang}
                                    </td>
                                    <td className="px-4 py-3 text-body-md">{item.kategori}</td>
                                    <td className="px-4 py-3 text-body-md">
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                        item.statusBarang === 'TERSEDIA' ? 'bg-tertiary-fixed-dim/30 text-tertiary-container' : 'bg-secondary-container text-on-secondary-container'
                                      }`}>
                                        {item.statusBarang}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-on-surface-variant italic text-sm">This user has not listed any items for rent yet.</p>
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
