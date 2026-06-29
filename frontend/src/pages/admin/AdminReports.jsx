import React, { useState, useEffect } from 'react';
import reportService from '../../services/report.service';
import adminService from '../../services/admin.service';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');

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
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status });
      }
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
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status: 'RESOLVED' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus barang');
    }
  };

  const openDetail = (report) => {
    setSelectedReport(report);
    if (window.innerWidth < 1024) {
      setIsMobilePanelOpen(true);
    }
  };

  const closeDetail = () => {
    setIsMobilePanelOpen(false);
    if (window.innerWidth >= 1024) {
      setSelectedReport(null);
    }
  };

  const pendingReports = reports.filter(r => r.status === 'PENDING').length;
  const resolvedReports = reports.filter(r => r.status === 'RESOLVED' || r.status === 'DISMISSED').length;
  const urgentReports = reports.filter(r => r.status === 'PENDING' && r.targetType === 'USER').length; // Mock logic for urgent

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.reporter?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.targetId?.toString().includes(searchTerm);
    
    let matchesStatus = true;
    if (filterStatus === 'Menunggu') matchesStatus = r.status === 'PENDING';
    else if (filterStatus === 'Selesai') matchesStatus = r.status === 'RESOLVED' || r.status === 'DISMISSED';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-stack-lg max-w-container-max mx-auto w-full pb-stack-xl">
      <style>{`
        .glass-panel {
          background: rgba(248, 249, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .report-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .report-card:hover {
          transform: translateX(4px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d3e4fe;
          border-radius: 10px;
        }
      `}</style>
      
      {/* Header & Stats */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Pusat Laporan & Moderasi</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Tangani keluhan pengguna dan jaga keamanan komunitas CampusRent.</p>
        </div>
        <div className="flex gap-stack-sm">
          <div className="bg-surface-container-high p-stack-sm rounded-lg border border-outline-variant/30 text-center min-w-[80px]">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Pending</p>
            <p className="font-title-md text-title-md text-primary">{pendingReports}</p>
          </div>
          <div className="bg-error-container p-stack-sm rounded-lg border border-error/20 text-center min-w-[80px]">
            <p className="font-label-sm text-label-sm text-on-error-container">Resolved</p>
            <p className="font-title-md text-title-md text-error">{resolvedReports}</p>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <div className="glass-panel p-stack-md rounded-xl border border-outline-variant/20 flex flex-wrap items-center gap-stack-md shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md text-body-md" 
            placeholder="Cari laporan, user, atau ID..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-surface-bright border border-outline-variant rounded-lg px-4 py-2 font-label-md text-label-md outline-none focus:ring-2 focus:ring-primary"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="Semua Status">Semua Status</option>
          <option value="Menunggu">Menunggu (Pending)</option>
          <option value="Selesai">Selesai (Resolved)</option>
        </select>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Report List */}
        <div className="lg:col-span-7 space-y-stack-sm overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant bg-surface-container-lowest glass-panel rounded-xl">
              <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">find_in_page</span>
              <p>Tidak ada laporan ditemukan</p>
            </div>
          ) : filteredReports.map((report) => (
            <div 
              key={report.id}
              className={`report-card cursor-pointer glass-panel p-stack-md rounded-xl border-l-4 border-y border-r border-outline-variant/20 transition-all group active:scale-[0.99] ${
                selectedReport?.id === report.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
              } ${
                report.status === 'PENDING' ? (report.targetType === 'USER' ? 'border-l-error' : 'border-l-tertiary') : 'border-l-secondary-fixed-dim'
              }`}
              onClick={() => openDetail(report)}
            >
              <div className="flex justify-between items-start mb-stack-xs">
                <div className="flex items-center gap-stack-sm">
                  {report.status === 'PENDING' ? (
                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm ${
                      report.targetType === 'USER' ? 'bg-error-container text-on-error-container' : 'bg-tertiary-container text-on-tertiary-container'
                    }`}>
                      {report.targetType === 'USER' ? 'URGENT (USER)' : 'PENDING (ITEM)'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                      {report.status}
                    </span>
                  )}
                  <span className="font-label-sm text-label-sm text-outline">#CR-{report.id.substring(0, 6)}</span>
                </div>
                <span className="font-label-sm text-label-sm text-outline">{new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
              
              <h3 className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors max-w-md truncate">
                Laporan: {report.targetType}
              </h3>
              
              <div className="grid grid-cols-2 gap-stack-md mt-stack-sm">
                <div>
                  <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Pelapor</p>
                  <p className="font-body-md text-body-md font-medium">{report.reporter?.nama || 'Unknown'}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Target ID</p>
                  <p className="font-body-md text-body-md font-medium">{report.targetId}</p>
                </div>
              </div>
              
              <div className="mt-stack-sm flex justify-between items-center">
                <span className="flex items-center gap-1 text-on-surface-variant font-label-md max-w-[200px] truncate">
                  <span className="material-symbols-outlined text-[18px]">info</span> {report.reason}
                </span>
                <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${
                  report.status === 'PENDING' ? 'bg-surface-container-highest text-primary' : 'bg-secondary-container/50 text-on-secondary-container'
                }`}>
                  {report.status === 'PENDING' ? 'Menunggu' : 'Diproses'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail View Panel */}
        <div className={`lg:col-span-5 h-fit glass-panel rounded-2xl border border-outline-variant/30 shadow-xl overflow-hidden ${
          isMobilePanelOpen ? 'fixed inset-0 z-[60] m-0 rounded-none' : 'hidden lg:block sticky top-24'
        }`}>
          <div className="p-stack-lg space-y-stack-lg">
            <div className="flex justify-between items-center">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Detail Tiket</h2>
              <button className="lg:hidden p-2 rounded-full hover:bg-surface-container-high" onClick={closeDetail}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {!selectedReport ? (
              <div className="text-center py-stack-xl space-y-stack-md">
                <span className="material-symbols-outlined text-[64px] text-outline/30">find_in_page</span>
                <p className="text-on-surface-variant font-body-md">Pilih laporan di sisi kiri untuk melihat detail dan mengambil tindakan moderasi.</p>
              </div>
            ) : (
              <div className="space-y-stack-lg animate-fade-in">
                <div className="space-y-stack-sm">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded font-label-sm text-label-sm ${
                      selectedReport.status === 'PENDING' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'
                    }`}>
                      {selectedReport.status}
                    </span>
                    <span className="font-label-sm text-label-sm text-outline">ID: #CR-{selectedReport.id.substring(0, 8)}</span>
                  </div>
                  <h3 className="font-title-md text-title-md text-on-surface">Laporan {selectedReport.targetType}</h3>
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                    <p className="text-on-surface-variant font-body-md leading-relaxed">
                      "{selectedReport.reason}"
                    </p>
                  </div>
                </div>
                
                <div className="p-stack-md bg-surface-container-lowest rounded-xl border border-outline-variant/20 space-y-stack-md shadow-sm">
                  <div className="space-y-stack-xs">
                    <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                      <span className="font-label-md text-label-md text-outline">Pelapor:</span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">{selectedReport.reporter?.nama || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between border-b border-outline-variant/10 pb-2 pt-2">
                      <span className="font-label-md text-label-md text-outline">Target Type:</span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">{selectedReport.targetType}</span>
                    </div>
                    <div className="flex justify-between border-b border-outline-variant/10 pb-2 pt-2">
                      <span className="font-label-md text-label-md text-outline">Target ID:</span>
                      <span className="font-label-md text-label-md font-bold text-on-surface font-mono text-xs mt-0.5">{selectedReport.targetId}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-label-md text-label-md text-outline">Tanggal:</span>
                      <span className="font-label-md text-label-md text-on-surface">{new Date(selectedReport.createdAt).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {selectedReport.status === 'PENDING' ? (
                  <div className="pt-stack-md space-y-stack-sm border-t border-outline-variant/20">
                    <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Tindakan Moderasi</p>
                    
                    <div className="grid grid-cols-2 gap-stack-sm">
                      <button 
                        onClick={() => handleUpdateStatus(selectedReport.id, 'DISMISSED')}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[20px]">cancel</span> Dismiss
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedReport.id, 'RESOLVED')}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-secondary-container text-on-secondary-container font-bold hover:brightness-95 transition-all active:scale-95 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[20px]">check_circle</span> Resolve
                      </button>
                    </div>
                    
                    {selectedReport.targetType === 'ITEM' && selectedReport.itemId && (
                      <button 
                        onClick={() => handleDeleteItem(selectedReport.id, selectedReport.itemId)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-error text-on-error font-bold hover:bg-error/90 transition-all active:scale-[0.98] shadow-lg shadow-error/20"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete_forever</span> Hapus Barang Permanen
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="pt-stack-md border-t border-outline-variant/20">
                    <div className="p-4 bg-surface-container-high rounded-xl text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl mb-2">task_alt</span>
                      <p className="font-bold">Laporan telah ditangani</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
