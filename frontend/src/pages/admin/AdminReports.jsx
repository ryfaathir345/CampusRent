import React, { useState, useEffect } from 'react';
import reportService from '../../services/report.service';
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
    <div className="animate-fade-in max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">System Reports</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Manage user complaints and item policy violations across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-full text-on-surface-variant hover:bg-surface-container transition-colors font-label-md">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full hover:opacity-90 transition-opacity font-label-md shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Log
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
          <p className="text-on-surface-variant text-label-sm uppercase tracking-wider mb-2">Total Pending</p>
          <div className="flex items-end gap-3">
            <h3 className="text-display-lg font-display-lg text-primary">{pendingReports}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
          <p className="text-on-surface-variant text-label-sm uppercase tracking-wider mb-2">Resolved</p>
          <div className="flex items-end gap-3">
            <h3 className="text-display-lg font-display-lg text-tertiary">{resolvedReports}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm col-span-1 md:col-span-2 overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-on-surface-variant text-label-sm uppercase tracking-wider mb-2">Safety Health Score</p>
            <h3 className="text-headline-md font-headline-md">98.4%</h3>
            <div className="w-full bg-surface-container-high h-2 rounded-full mt-4">
              <div className="bg-tertiary h-2 rounded-full w-[98.4%]"></div>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          </div>
        </div>
      </div>

      {/* Moderation Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase">Reporter</th>
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase">Target Type</th>
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase">Reason</th>
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase">Date</th>
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase">Status</th>
                <th className="px-6 py-4 font-bold text-label-sm text-on-surface-variant uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant">No reports found.</td>
                </tr>
              ) : reports.map(r => (
                <tr key={r.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-label-sm font-bold">
                        {r.reporter?.nama ? r.reporter.nama.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{r.reporter?.nama || 'Unknown'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline text-[20px]">
                        {r.targetType === 'ITEM' ? 'inventory_2' : 'person'}
                      </span>
                      <span className="text-on-surface font-medium">{r.targetType} ({r.targetId})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-on-surface-variant max-w-[240px] truncate" title={r.reason}>
                      {r.reason}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-[6px] text-label-sm font-semibold ${
                      r.status === 'PENDING' ? 'bg-primary/10 text-primary' :
                      r.status === 'RESOLVED' ? 'bg-tertiary/10 text-tertiary' :
                      'bg-outline-variant/20 text-outline'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {r.status === 'PENDING' ? (
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(r.id, 'RESOLVED')}
                          className="px-4 py-1.5 bg-tertiary text-white rounded-full text-label-sm font-bold hover:bg-tertiary-container transition-all active:scale-95"
                        >
                          Resolve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(r.id, 'DISMISSED')}
                          className="px-4 py-1.5 bg-outline-variant/30 text-on-surface-variant rounded-full text-label-sm font-bold hover:bg-outline-variant/50 transition-all active:scale-95"
                        >
                          Dismiss
                        </button>
                      </div>
                    ) : (
                      <span className="text-on-surface-variant text-label-sm italic">Processed</span>
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
