import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as paymentService from '../../services/payment.service';
import * as walletService from '../../services/wallet.service';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const AdminFinance = () => {
  const [activeTab, setActiveTab] = useState('profit'); // profit, verification, withdrawals
  const [isLoading, setIsLoading] = useState(true);
  
  const [payments, setPayments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [topUps, setTopUps] = useState([]);
  const [revenue, setRevenue] = useState({ totalRevenue: 0, chartData: [] });
  const [imageModal, setImageModal] = useState({ isOpen: false, url: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'profit') {
        const revRes = await paymentService.getAdminRevenue();
        setRevenue(revRes.data);
      } else if (activeTab === 'verification') {
        const payRes = await paymentService.getPendingPayments();
        setPayments(payRes.data);
      } else if (activeTab === 'withdrawals') {
        const wdRes = await walletService.getPendingWithdrawals();
        setWithdrawals(wdRes.data);
      } else if (activeTab === 'topups') {
        const tuRes = await walletService.getPendingTopUps();
        setTopUps(tuRes.data);
      }
    } catch (err) {
      toast.error('Gagal memuat data keuangan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleVerifyPayment = async (id, action) => {
    try {
      toast.loading('Memproses pembayaran...', { id: 'verifyPay' });
      await paymentService.verifyPayment(id, action);
      toast.success(action === 'approve' ? 'Pembayaran disetujui' : 'Pembayaran ditolak', { id: 'verifyPay' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses pembayaran', { id: 'verifyPay' });
    }
  };

  const handleProcessWithdrawal = async (id, action) => {
    try {
      toast.loading('Memproses penarikan...', { id: 'processWd' });
      await walletService.processWithdrawal(id, action);
      toast.success(action === 'approve' ? 'Penarikan disetujui' : 'Penarikan ditolak', { id: 'processWd' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses penarikan', { id: 'processWd' });
    }
  };

  const handleProcessTopUp = async (id, action) => {
    try {
      toast.loading('Memproses top up...', { id: 'processTu' });
      await walletService.processTopUp(id, action);
      toast.success(action === 'approve' ? 'Top up disetujui' : 'Top up ditolak', { id: 'processTu' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses top up', { id: 'processTu' });
    }
  };

  const handleExportFinancePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138);
      doc.text('Laporan Pendapatan CampusRent', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text(`Total Laba Keseluruhan: Rp ${revenue.totalRevenue.toLocaleString('id-ID')}`, 14, 40);

      const tableData = revenue.chartData.map(item => [
        item.date,
        `Rp ${item.revenue.toLocaleString('id-ID')}`
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Tanggal', 'Pendapatan (Laba Admin 10%)']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [99, 14, 212] }, // primary color
      });

      doc.save('Laporan_Pendapatan_CampusRent.pdf');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mencetak PDF: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="font-bold text-gray-800 text-title-md dark:text-white/90 mb-1">Financial Oversight</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitor platform revenue, manage payouts, and verify transaction integrity.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportFinancePDF}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white rounded-full font-medium text-sm shadow-theme-md hover:bg-brand-600 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('profit')}
          className={`px-8 py-4 text-sm font-medium transition-all whitespace-nowrap relative ${activeTab === 'profit' ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400'}`}
        >
          Platform Profit
          {activeTab === 'profit' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-brand-500 rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('verification')}
          className={`px-8 py-4 text-sm font-medium transition-all whitespace-nowrap relative ${activeTab === 'verification' ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400'}`}
        >
          Payment Verification
          {activeTab === 'verification' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-brand-500 rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('withdrawals')}
          className={`px-8 py-4 text-sm font-medium transition-all whitespace-nowrap relative ${activeTab === 'withdrawals' ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400'}`}
        >
          Withdrawal Requests
          {activeTab === 'withdrawals' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-brand-500 rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('topups')}
          className={`px-8 py-4 text-sm font-medium transition-all whitespace-nowrap relative ${activeTab === 'topups' ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400'}`}
        >
          Top Up Verification
          {activeTab === 'topups' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-brand-500 rounded-t-full"></span>}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-10 w-10 border-b-2 border-brand-500 rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Platform Profit Tab */}
          {activeTab === 'profit' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              {/* Summary Bento Grid */}
              <div className="lg:col-span-4 space-y-4 md:space-y-6">
                {/* Total Earnings Card */}
                <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl shadow-theme-sm border border-gray-200 dark:border-gray-800 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[80px] text-brand-500">payments</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-2">Total Earnings</p>
                  <h3 className="font-bold text-title-xl2 text-brand-500 dark:text-brand-400 mb-4">Rp {revenue.totalRevenue.toLocaleString('id-ID')}</h3>
                  <div className="flex items-center gap-2 text-success-500 text-xs font-medium">
                    <span className="material-symbols-outlined text-[18px]">trending_up</span>
                    <span>10% Admin Fee applied</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl shadow-theme-sm border border-gray-200 dark:border-gray-800 border-l-4 border-l-warning-500 dark:border-l-warning-400">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-2">Recent Payouts</p>
                  <div className="flex justify-between items-end">
                    <h3 className="font-bold text-title-lg text-gray-800 dark:text-white/90">Stable</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Processed automatically</span>
                  </div>
                </div>
              </div>

              {/* Main Revenue Chart */}
              <div className="lg:col-span-8">
                <div className="bg-white dark:bg-white/[0.03] p-6 rounded-2xl shadow-theme-sm border border-gray-200 dark:border-gray-800 h-full min-h-[400px] flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h4 className="font-bold text-title-sm text-gray-800 dark:text-white/90">Income Trends</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aggregated revenue from platform fees</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full relative -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenue.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc3d8" strokeOpacity={0.2} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8A99AF', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8A99AF', fontSize: 12 }} dx={-10} tickFormatter={(value) => `Rp${value/1000}k`} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                          formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#3C50E0" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3C50E0' }} activeDot={{ r: 6, fill: '#3C50E0', stroke: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Verification Tab */}
          {activeTab === 'verification' && (
            <div className="bg-white dark:bg-white/[0.03] rounded-2xl shadow-theme-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h4 className="font-bold text-title-sm text-gray-800 dark:text-white/90">Menunggu Verifikasi Pembayaran</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Peminjam</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Barang</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Harga</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Metode</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bukti</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Tidak ada pembayaran yang menunggu verifikasi.</td>
                      </tr>
                    ) : payments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{p.transaction.borrower.nama}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{p.transaction.item.namaBarang}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pemilik: {p.transaction.item.owner.nama}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-white/90">Rp {p.amount.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{p.paymentMethod}</span>
                        </td>
                        <td className="px-6 py-4">
                          {p.proofOfPayment ? (
                            <button onClick={() => setImageModal({ isOpen: true, url: `${UPLOADS_URL}${p.proofOfPayment}` })} className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium flex items-center gap-1 transition-colors">
                              <span className="material-symbols-outlined text-[16px]">receipt</span> Lihat Bukti
                            </button>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 italic text-sm">Tidak ada bukti</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleVerifyPayment(p.id, 'approve')} className="px-4 py-1.5 bg-success-50 text-success-600 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-500 dark:hover:bg-success-500/20 font-medium text-xs rounded-full transition-colors active:scale-95 border border-success-200 dark:border-success-500/30">Setujui</button>
                            <button onClick={() => handleVerifyPayment(p.id, 'reject')} className="px-4 py-1.5 bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-500 dark:hover:bg-error-500/20 font-medium text-xs rounded-full transition-colors active:scale-95 border border-error-200 dark:border-error-500/30">Tolak</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Withdrawal Requests Tab */}
          {activeTab === 'withdrawals' && (
            <div className="bg-white dark:bg-white/[0.03] rounded-2xl shadow-theme-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h4 className="font-bold text-title-sm text-gray-800 dark:text-white/90">Menunggu Proses Penarikan Dana</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pengguna</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jumlah</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Informasi Bank</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal Request</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Tidak ada permintaan penarikan dana.</td>
                      </tr>
                    ) : withdrawals.map(w => (
                      <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{w.user.nama}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{w.user.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-white/90">Rp {w.amount.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{w.bankName} - {w.accountNumber}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">a.n {w.accountName}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(w.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleProcessWithdrawal(w.id, 'approve')} className="px-4 py-1.5 bg-success-50 text-success-600 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-500 dark:hover:bg-success-500/20 font-medium text-xs rounded-full transition-colors active:scale-95 border border-success-200 dark:border-success-500/30">Selesai Proses</button>
                            <button onClick={() => handleProcessWithdrawal(w.id, 'reject')} className="px-4 py-1.5 bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-500 dark:hover:bg-error-500/20 font-medium text-xs rounded-full transition-colors active:scale-95 border border-error-200 dark:border-error-500/30">Tolak</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Up Requests Tab */}
          {activeTab === 'topups' && (
            <div className="bg-white dark:bg-white/[0.03] rounded-2xl shadow-theme-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h4 className="font-bold text-title-sm text-gray-800 dark:text-white/90">Menunggu Verifikasi Top Up Saldo</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pengguna</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jumlah</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bukti Transfer</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal Request</th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {topUps.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Tidak ada permintaan top up saldo.</td>
                      </tr>
                    ) : topUps.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{t.user.nama}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.user.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-success-500 dark:text-success-400">+ Rp {t.amount.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4">
                          {t.buktiUrl ? (
                            <button onClick={() => setImageModal({ isOpen: true, url: `${UPLOADS_URL}${t.buktiUrl}` })} className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-medium flex items-center gap-1 transition-colors">
                              <span className="material-symbols-outlined text-[16px]">receipt</span> Lihat Bukti
                            </button>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 italic text-sm">Tidak ada bukti</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(t.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleProcessTopUp(t.id, 'approve')} className="px-4 py-1.5 bg-success-50 text-success-600 hover:bg-success-100 dark:bg-success-500/10 dark:text-success-500 dark:hover:bg-success-500/20 font-medium text-xs rounded-full transition-colors active:scale-95 border border-success-200 dark:border-success-500/30">Setujui</button>
                            <button onClick={() => handleProcessTopUp(t.id, 'reject')} className="px-4 py-1.5 bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-500 dark:hover:bg-error-500/20 font-medium text-xs rounded-full transition-colors active:scale-95 border border-error-200 dark:border-error-500/30">Tolak</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Image View Modal */}
      {imageModal.isOpen && createPortal(
        <div 
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
          onClick={() => setImageModal({ isOpen: false, url: '' })}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 shrink-0">
              <h3 className="font-bold text-title-sm text-gray-800 dark:text-white/90">Bukti Transfer</h3>
              <button 
                onClick={() => setImageModal({ isOpen: false, url: '' })} 
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px] block">close</span>
              </button>
            </div>
            <div className="p-4 flex-1 min-h-0 flex items-center justify-center bg-gray-100 dark:bg-gray-950 overflow-auto">
              <img src={imageModal.url} alt="Bukti Transfer" className="max-w-full h-auto rounded-lg object-contain shadow-theme-md" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminFinance;
