import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const filteredUsers = users.filter(u => 
    u.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nim?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header & Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
        <div className="md:col-span-2 glass-panel p-stack-lg rounded-xl shadow-sm border border-outline-variant/10">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Manajemen Pengguna</h1>
          <p className="text-body-md text-on-surface-variant mt-2">Pantau, verifikasi, dan kelola status akun mahasiswa di seluruh platform CampusRent.</p>
          <div className="flex flex-wrap gap-stack-sm mt-6">
            <button className="px-4 py-2 bg-primary text-on-primary font-label-md rounded-full shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              Tambah Pengguna
            </button>
            <button className="px-4 py-2 border border-outline text-on-surface-variant font-label-md rounded-full hover:bg-surface-container transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">download</span>
              Ekspor CSV
            </button>
          </div>
        </div>
        <div className="glass-panel p-stack-lg rounded-xl shadow-sm border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-primary">Total Mahasiswa</span>
            <div className="text-display-lg font-display-lg text-primary mt-2">{users.length}</div>
          </div>
          <div className="flex items-center gap-2 text-secondary text-label-md mt-4">
            <span className="material-symbols-outlined">group</span>
            <span>{users.filter(u => !u.isSuspended).length} Aktif</span>
          </div>
        </div>
      </div>

      {/* Role Selector Notice */}
      <div className="flex items-center justify-between glass-panel p-stack-sm rounded-xl border border-outline-variant/10 px-4">
        <div className="flex items-center gap-4">
          <span className="text-label-md font-bold">Mode Tampilan:</span>
          <div className="flex bg-surface-container p-1 rounded-lg">
            <button className={`px-4 py-1.5 rounded-md text-label-md font-bold transition-all shadow-sm ${!isOwner ? 'bg-primary text-white' : 'text-on-surface-variant'}`}>Admin</button>
            <button className={`px-4 py-1.5 rounded-md text-label-md font-bold transition-all shadow-sm ${isOwner ? 'bg-primary-container text-white' : 'text-on-surface-variant'}`}>Owner</button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-label-sm text-on-surface-variant italic">
          <span className="material-symbols-outlined text-sm">info</span>
          <span>{isOwner ? 'Owner View: Semua fitur manajemen terbuka.' : 'Role Admin tidak bisa mengubah jabatan user lain.'}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-panel p-stack-md rounded-xl border border-outline-variant/10 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
            placeholder="Cari nama, NIM, atau jurusan..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-xl border border-outline-variant/10 shadow-md overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container text-on-surface-variant font-label-md">
              <tr>
                <th className="px-6 py-4 font-bold">Nama / NIM</th>
                <th className="px-6 py-4 font-bold">Jurusan</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredUsers.map(u => (
                <tr key={u.id} className={`hover:bg-primary/5 transition-colors group ${u.isSuspended ? 'bg-error/5' : ''}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-lg">
                        {u.nama ? u.nama.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">{u.nama}</div>
                        <div className="text-label-sm text-on-surface-variant">{u.nim || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-body-md text-on-surface-variant">{u.jurusan || '-'}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 font-label-sm rounded-full border ${u.role === 'ADMIN' || u.role === 'OWNER' ? 'bg-tertiary-container/10 text-tertiary border-tertiary/20 font-bold' : 'bg-surface-container-highest text-primary border-primary/10'}`}>
                      {u.role === 'ADMIN' ? 'Admin' : u.role === 'OWNER' ? 'Owner' : 'Mahasiswa'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1 items-center">
                      <div className={`flex items-center gap-1.5 text-label-sm font-bold ${u.isVerified ? 'text-secondary' : 'text-outline'}`}>
                        <span className="material-symbols-outlined text-[16px]" style={u.isVerified ? { fontVariationSettings: "'FILL' 1" } : {}}>{u.isVerified ? 'verified' : 'hourglass_empty'}</span>
                        {u.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                      </div>
                      {u.isSuspended ? (
                        <span className="px-2 py-0.5 bg-error-container text-on-error-container text-[10px] uppercase font-bold rounded">Suspended</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-secondary-container/30 text-on-secondary-container text-[10px] uppercase font-bold rounded">Aktif</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-on-surface">{u.email}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {isOwner && (
                        <button 
                          onClick={() => handleUpdateRole(u.id, u.role === 'ADMIN' ? 'MAHASISWA' : 'ADMIN')}
                          className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-all" 
                          title="Ubah Role"
                        >
                          <span className="material-symbols-outlined">swap_horiz</span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleToggleSuspend(u.id)}
                        className={`p-2 rounded-lg transition-all ${u.isSuspended ? 'text-secondary hover:bg-secondary/10' : 'text-error hover:bg-error/10'}`} 
                        title={u.isSuspended ? 'Restore User' : 'Suspend User'}
                      >
                        <span className="material-symbols-outlined">{u.isSuspended ? 'check_circle' : 'block'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-on-surface-variant">Data tidak ditemukan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
