import React, { useState, useEffect } from 'react';
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
  const [revenue, setRevenue] = useState({ totalRevenue: 0, chartData: [] });

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
    <div className="animate-fade-in max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Financial Oversight</h2>
          <p className="text-on-surface-variant font-body-md">Monitor platform revenue, manage payouts, and verify transaction integrity.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportFinancePDF}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full font-label-md shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="flex border-b border-outline-variant mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('profit')}
          className={`px-8 py-4 font-label-md transition-all whitespace-nowrap relative ${activeTab === 'profit' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          Platform Profit
          {activeTab === 'profit' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('verification')}
          className={`px-8 py-4 font-label-md transition-all whitespace-nowrap relative ${activeTab === 'verification' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          Payment Verification
          {activeTab === 'verification' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('withdrawals')}
          className={`px-8 py-4 font-label-md transition-all whitespace-nowrap relative ${activeTab === 'withdrawals' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          Withdrawal Requests
          {activeTab === 'withdrawals' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary"></span>}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Platform Profit Tab */}
          {activeTab === 'profit' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              {/* Summary Bento Grid */}
              <div className="lg:col-span-4 space-y-gutter">
                {/* Total Earnings Card */}
                <div className="glass-card bg-white p-stack-lg rounded-xl shadow-sm border border-outline-variant overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[80px] text-primary">payments</span>
                  </div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold mb-2">Total Earnings</p>
                  <h3 className="font-display-lg text-display-lg text-primary mb-4">Rp {revenue.totalRevenue.toLocaleString('id-ID')}</h3>
                  <div className="flex items-center gap-2 text-tertiary font-label-sm">
                    <span className="material-symbols-outlined text-[18px]">trending_up</span>
                    <span>10% Admin Fee applied</span>
                  </div>
                </div>

                <div className="glass-card bg-white p-stack-lg rounded-xl shadow-sm border border-outline-variant border-l-4 border-l-secondary">
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold mb-2">Recent Payouts</p>
                  <div className="flex justify-between items-end">
                    <h3 className="font-headline-md text-headline-md text-on-surface">Stable</h3>
                    <span className="text-label-sm text-on-surface-variant">Processed automatically</span>
                  </div>
                </div>
              </div>

              {/* Main Revenue Chart */}
              <div className="lg:col-span-8">
                <div className="bg-white p-gutter rounded-xl shadow-sm border border-outline-variant h-full min-h-[400px] flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface">Income Trends</h4>
                      <p className="text-body-md text-on-surface-variant">Aggregated revenue from platform fees</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenue.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc3d8" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#4a4455', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4a4455', fontSize: 12 }} dx={-10} tickFormatter={(value) => `Rp${value/1000}k`} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#630ed4" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Verification Tab */}
          {activeTab === 'verification' && (
            <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
              <div className="p-gutter border-b border-outline-variant">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">Menunggu Verifikasi Pembayaran</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-label-sm text-on-surface-variant uppercase tracking-wider">
                    <tr>
                      <th className="px-gutter py-4 font-bold">Peminjam</th>
                      <th className="px-gutter py-4 font-bold">Barang</th>
                      <th className="px-gutter py-4 font-bold">Total Harga</th>
                      <th className="px-gutter py-4 font-bold">Metode</th>
                      <th className="px-gutter py-4 font-bold">Bukti</th>
                      <th className="px-gutter py-4 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-gutter py-8 text-center text-on-surface-variant">Tidak ada pembayaran yang menunggu verifikasi.</td>
                      </tr>
                    ) : payments.map(p => (
                      <tr key={p.id} className="hover:bg-surface transition-colors">
                        <td className="px-gutter py-4">
                          <p className="font-body-md font-bold text-on-surface">{p.transaction.borrower.nama}</p>
                        </td>
                        <td className="px-gutter py-4">
                          <p className="font-body-md text-on-surface">{p.transaction.item.namaBarang}</p>
                          <p className="font-label-sm text-on-surface-variant text-xs">Pemilik: {p.transaction.item.owner.nama}</p>
                        </td>
                        <td className="px-gutter py-4 font-bold text-on-surface">Rp {p.amount.toLocaleString('id-ID')}</td>
                        <td className="px-gutter py-4">
                          <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface-variant font-label-sm">{p.paymentMethod}</span>
                        </td>
                        <td className="px-gutter py-4">
                          {p.proofOfPayment ? (
                            <a href={`${UPLOADS_URL}${p.proofOfPayment}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-label-sm flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">receipt</span> Lihat Bukti
                            </a>
                          ) : (
                            <span className="text-on-surface-variant italic font-label-sm">Tidak ada bukti</span>
                          )}
                        </td>
                        <td className="px-gutter py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleVerifyPayment(p.id, 'approve')} className="px-4 py-1.5 bg-tertiary text-white rounded-full font-label-sm hover:bg-tertiary-container transition-colors shadow-sm">Setujui</button>
                            <button onClick={() => handleVerifyPayment(p.id, 'reject')} className="px-4 py-1.5 bg-error text-white rounded-full font-label-sm hover:bg-error-container transition-colors shadow-sm">Tolak</button>
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
            <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
              <div className="p-gutter border-b border-outline-variant">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">Menunggu Proses Penarikan Dana</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-label-sm text-on-surface-variant uppercase tracking-wider">
                    <tr>
                      <th className="px-gutter py-4 font-bold">Pengguna</th>
                      <th className="px-gutter py-4 font-bold">Jumlah</th>
                      <th className="px-gutter py-4 font-bold">Informasi Bank</th>
                      <th className="px-gutter py-4 font-bold">Tanggal Request</th>
                      <th className="px-gutter py-4 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-gutter py-8 text-center text-on-surface-variant">Tidak ada permintaan penarikan dana.</td>
                      </tr>
                    ) : withdrawals.map(w => (
                      <tr key={w.id} className="hover:bg-surface transition-colors">
                        <td className="px-gutter py-4">
                          <p className="font-body-md font-bold text-on-surface">{w.user.nama}</p>
                          <p className="font-label-sm text-on-surface-variant text-xs">{w.user.email}</p>
                        </td>
                        <td className="px-gutter py-4 font-bold text-on-surface">Rp {w.amount.toLocaleString('id-ID')}</td>
                        <td className="px-gutter py-4">
                          <p className="font-body-md text-on-surface">{w.bankName} - {w.accountNumber}</p>
                          <p className="font-label-sm text-on-surface-variant text-xs">a.n {w.accountName}</p>
                        </td>
                        <td className="px-gutter py-4 text-body-md text-on-surface-variant">
                          {new Date(w.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-gutter py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleProcessWithdrawal(w.id, 'approve')} className="px-4 py-1.5 bg-tertiary text-white rounded-full font-label-sm hover:bg-tertiary-container transition-colors shadow-sm">Selesai Proses</button>
                            <button onClick={() => handleProcessWithdrawal(w.id, 'reject')} className="px-4 py-1.5 bg-error text-white rounded-full font-label-sm hover:bg-error-container transition-colors shadow-sm">Tolak</button>
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
    </div>
  );
};

export default AdminFinance;
