import React, { useState, useEffect } from 'react';
import reportService from '../../services/report.service';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getReports();
      setReports(res.data);
    } catch (err) {
      toast.error('Gagal memuat data laporan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId, status) => {
    try {
      await reportService.updateReportStatus(reportId, { status });
      toast.success('Status laporan berhasil diperbarui');
      fetchReports();
    } catch (err) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleDeleteItem = async (reportId, itemId) => {
    if (!window.confirm('Yakin ingin menghapus barang ini secara permanen?')) return;
    try {
      await adminService.deleteItem(itemId);
      toast.success('Barang berhasil dihapus secara permanen');
      // Resolve the report automatically
      await reportService.updateReportStatus(reportId, { status: 'RESOLVED' });
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus barang');
    }
  };

  const pendingReports = reports.filter(r => r.status === 'PENDING').length;
  const resolvedReports = reports.filter(r => r.status === 'RESOLVED' || r.status === 'DISMISSED').length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[1440px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6">
        <div>
          <h2 className="font-bold text-gray-800 text-title-md dark:text-white/90">System Reports</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage user complaints and item policy violations across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors text-sm font-medium shadow-theme-md">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Log
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 group hover:shadow-theme-sm transition-all">
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-2">Total Pending</p>
          <div className="flex items-end gap-3">
            <h3 className="text-title-xl font-bold text-brand-500 dark:text-brand-400">{pendingReports}</h3>
          </div>
        </div>
        
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 group hover:shadow-theme-sm transition-all">
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-2">Resolved</p>
          <div className="flex items-end gap-3">
            <h3 className="text-title-xl font-bold text-success-500 dark:text-success-400">{resolvedReports}</h3>
          </div>
        </div>
        
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 col-span-1 md:col-span-2 overflow-hidden relative group hover:shadow-theme-sm transition-all">
          <div className="relative z-10">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-2">Safety Health Score</p>
            <h3 className="text-title-xl font-bold text-gray-800 dark:text-white/90">98.4%</h3>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mt-4">
              <div className="bg-success-500 h-2 rounded-full w-[98.4%]"></div>
            </div>
          </div>
          <div className="absolute right-4 bottom-4 opacity-10">
            <span className="material-symbols-outlined text-[100px] text-gray-800 dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          </div>
        </div>
      </div>

      {/* Moderation Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reporter</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target Type</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No reports found.</td>
                </tr>
              ) : reports.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">
                        {r.reporter?.nama ? r.reporter.nama.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{r.reporter?.nama || 'Unknown'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="material-symbols-outlined text-[20px]">
                        {r.targetType === 'ITEM' ? 'inventory_2' : 'person'}
                      </span>
                      <span className="text-sm font-medium">{r.targetType} ({r.targetId})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-[240px] truncate" title={r.reason}>
                      {r.reason}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      r.status === 'PENDING' ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500' :
                      r.status === 'RESOLVED' ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {r.status === 'PENDING' ? (
                      <div className="flex justify-center gap-2 flex-wrap">
                        {r.targetType === 'ITEM' && r.itemId && (
                          <button 
                            onClick={() => handleDeleteItem(r.id, r.itemId)}
                            className="px-4 py-1.5 border border-error-200 text-error-600 rounded-full text-xs font-medium hover:bg-error-50 dark:border-error-500/30 dark:text-error-500 dark:hover:bg-error-500/10 transition-all active:scale-95"
                          >
                            Delete Item
                          </button>
                        )}
                        <button 
                          onClick={() => handleUpdateStatus(r.id, 'RESOLVED')}
                          className="px-4 py-1.5 border border-success-200 text-success-600 rounded-full text-xs font-medium hover:bg-success-50 dark:border-success-500/30 dark:text-success-500 dark:hover:bg-success-500/10 transition-all active:scale-95"
                        >
                          Resolve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(r.id, 'DISMISSED')}
                          className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-all active:scale-95"
                        >
                          Dismiss
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
