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
  const [activeTab, setActiveTab] = useState('profit'); // profit, verification, withdrawals, topups
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
        headStyles: { fillColor: [99, 14, 212] },
      });

      doc.save('Laporan_Pendapatan_CampusRent.pdf');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mencetak PDF: ' + err.message);
    }
  };

  return (
    <div className="space-y-gutter bg-[#050811] text-on-primary-container p-6 rounded-2xl">
      <style>{`
        .glass-dark {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .neon-border {
          box-shadow: 0 0 15px rgba(0, 243, 255, 0.2);
        }
        .gold-gradient {
          background: linear-gradient(135deg, #FFD700 0%, #B8860B 100%);
        }
      `}</style>
      
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="glass-dark rounded-xl p-stack-lg relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-stack-md">
              <span className="text-label-md font-bold text-surface-variant/80 uppercase tracking-widest">Saldo Platform</span>
              <span className="material-symbols-outlined text-[#00F3FF] neon-border rounded-full p-2 bg-[#00F3FF]/10">account_balance_wallet</span>
            </div>
            <h2 className="font-display-lg text-display-lg text-white mb-stack-xs">Rp {(revenue.totalRevenue * 10).toLocaleString('id-ID')}</h2>
            <div className="flex items-center gap-2 text-secondary-fixed-dim font-label-md">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>Total Volume</span>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-stack-lg relative overflow-hidden group">
          <div className="absolute inset-0 gold-gradient opacity-5"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-stack-md">
              <span className="text-label-md font-bold text-[#FFD700]/80 uppercase tracking-widest">Total Komisi</span>
              <span className="material-symbols-outlined text-[#FFD700] neon-border rounded-full p-2 bg-[#FFD700]/10">auto_graph</span>
            </div>
            <h2 className="font-display-lg text-display-lg text-white mb-stack-xs">Rp {revenue.totalRevenue.toLocaleString('id-ID')}</h2>
            <div className="flex items-center gap-2 text-[#FFD700] font-label-md">
              <span className="material-symbols-outlined text-sm">stars</span>
              <span>Fee 10% Terakumulasi</span>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-stack-lg relative overflow-hidden group border-l-4 border-error/50">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-stack-md">
              <span className="text-label-md font-bold text-error/80 uppercase tracking-widest">Permintaan WD</span>
              <span className="material-symbols-outlined text-error neon-border rounded-full p-2 bg-error/10">pending_actions</span>
            </div>
            <h2 className="font-display-lg text-display-lg text-white mb-stack-xs">{withdrawals.length || 0} <span className="text-headline-lg font-normal opacity-50">Pending</span></h2>
            <div className="flex items-center gap-2 text-error font-label-md">
              <span className="material-symbols-outlined text-sm">timer</span>
              <span className="animate-pulse">Segera Proses Transaksi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Graph Section */}
      <div className="glass-dark rounded-xl p-stack-lg border border-white/10 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-stack-lg gap-stack-md">
          <div>
            <h3 className="font-headline-lg text-headline-lg text-white">Revenue Growth</h3>
            <p className="text-body-md text-surface-variant/60">Pertumbuhan pendapatan platform</p>
          </div>
          <div className="flex gap-stack-sm bg-surface-container-low/20 p-stack-xs rounded-lg">
            <button onClick={handleExportFinancePDF} className="flex items-center gap-2 px-4 py-1.5 text-label-md bg-primary-container rounded-md text-white">
              <span className="material-symbols-outlined text-[18px]">download</span> Export PDF
            </button>
          </div>
        </div>
        
        <div className="h-64 w-full relative">
          {revenue.chartData && revenue.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.1} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8A99AF', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8A99AF', fontSize: 12 }} dx={-10} tickFormatter={(value) => `Rp${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.9)', color: '#fff' }}
                  formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#00F3FF" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#050811', stroke: '#00F3FF' }} activeDot={{ r: 6, fill: '#00F3FF', stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-surface-variant/40">Belum ada data pendapatan</div>
          )}
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="glass-dark rounded-xl border border-white/5 overflow-hidden mt-6">
        <div className="p-stack-lg border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-md">
          <div>
            <h3 className="font-title-md text-title-md text-white">Log Transaksi Platform</h3>
            <p className="text-label-md text-surface-variant/60">Data real-time aliran dana CampusRent</p>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <button 
              onClick={() => setActiveTab('profit')}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'profit' ? 'bg-white/20 text-white' : 'bg-white/5 text-surface-variant/60 hover:bg-white/10'}`}
            >
              Semua
            </button>
            <button 
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'verification' ? 'bg-white/20 text-white' : 'bg-white/5 text-surface-variant/60 hover:bg-white/10'}`}
            >
              Pembayaran
            </button>
            <button 
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'withdrawals' ? 'bg-white/20 text-white' : 'bg-white/5 text-surface-variant/60 hover:bg-white/10'}`}
            >
              Penarikan
            </button>
            <button 
              onClick={() => setActiveTab('topups')}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === 'topups' ? 'bg-white/20 text-white' : 'bg-white/5 text-surface-variant/60 hover:bg-white/10'}`}
            >
              Top Up
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin h-8 w-8 border-b-2 border-[#00F3FF] rounded-full"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-label-sm text-surface-variant/60 uppercase tracking-tighter">
                <tr>
                  <th className="px-stack-lg py-4">Informasi Transaksi</th>
                  <th className="px-stack-lg py-4">Tipe</th>
                  <th className="px-stack-lg py-4">Pengguna</th>
                  <th className="px-stack-lg py-4">Nominal</th>
                  <th className="px-stack-lg py-4 text-center">Status</th>
                  <th className="px-stack-lg py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-body-md text-surface-variant">
                
                {/* Verification Tab Content */}
                {activeTab === 'verification' && payments.map(p => (
                  <tr key={`p-${p.id}`} className="hover:bg-white/5 transition-colors group">
                    <td className="px-stack-lg py-4">
                      <div className="font-mono text-primary-fixed-dim text-sm">#{p.id.substring(0,8).toUpperCase()}</div>
                      <div className="text-xs mt-1 text-surface-variant/60">{p.transaction.item.namaBarang}</div>
                    </td>
                    <td className="px-stack-lg py-4">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span> Pembayaran
                      </span>
                    </td>
                    <td className="px-stack-lg py-4 text-white text-sm">{p.transaction.borrower.nama}</td>
                    <td className="px-stack-lg py-4 text-white font-medium">Rp {p.amount.toLocaleString('id-ID')}</td>
                    <td className="px-stack-lg py-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-error-container/20 text-error text-label-sm">Pending</span>
                    </td>
                    <td className="px-stack-lg py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {p.proofOfPayment && (
                          <button onClick={() => setImageModal({ isOpen: true, url: `${UPLOADS_URL}${p.proofOfPayment}` })} className="px-3 py-1.5 bg-white/10 text-white rounded-md text-xs hover:bg-white/20 transition-colors">Bukti</button>
                        )}
                        <button onClick={() => handleVerifyPayment(p.id, 'approve')} className="px-3 py-1.5 bg-secondary-container/20 text-secondary-container rounded-md text-xs hover:bg-secondary-container/40 transition-colors">Setujui</button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Withdrawals Tab Content */}
                {activeTab === 'withdrawals' && withdrawals.map(w => (
                  <tr key={`w-${w.id}`} className="hover:bg-white/5 transition-colors group">
                    <td className="px-stack-lg py-4">
                      <div className="font-mono text-primary-fixed-dim text-sm">#{w.id.substring(0,8).toUpperCase()}</div>
                      <div className="text-xs mt-1 text-surface-variant/60">{w.bankName} - {w.accountNumber}</div>
                    </td>
                    <td className="px-stack-lg py-4">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-error"></span> Penarikan
                      </span>
                    </td>
                    <td className="px-stack-lg py-4 text-white text-sm">{w.user.nama}</td>
                    <td className="px-stack-lg py-4 text-white font-medium">Rp {w.amount.toLocaleString('id-ID')}</td>
                    <td className="px-stack-lg py-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-error-container/20 text-error text-label-sm">Pending</span>
                    </td>
                    <td className="px-stack-lg py-4 text-right">
                      <button onClick={() => handleProcessWithdrawal(w.id, 'approve')} className="px-3 py-1.5 bg-secondary-container/20 text-secondary-container rounded-md text-xs hover:bg-secondary-container/40 transition-colors">Setujui</button>
                    </td>
                  </tr>
                ))}

                {/* Topups Tab Content */}
                {activeTab === 'topups' && topUps.map(t => (
                  <tr key={`t-${t.id}`} className="hover:bg-white/5 transition-colors group">
                    <td className="px-stack-lg py-4">
                      <div className="font-mono text-primary-fixed-dim text-sm">#{t.id.substring(0,8).toUpperCase()}</div>
                      <div className="text-xs mt-1 text-surface-variant/60">{new Date(t.createdAt).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="px-stack-lg py-4">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00F3FF]"></span> Top Up
                      </span>
                    </td>
                    <td className="px-stack-lg py-4 text-white text-sm">{t.user.nama}</td>
                    <td className="px-stack-lg py-4 text-white font-medium">Rp {t.amount.toLocaleString('id-ID')}</td>
                    <td className="px-stack-lg py-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-error-container/20 text-error text-label-sm">Pending</span>
                    </td>
                    <td className="px-stack-lg py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {t.buktiUrl && (
                          <button onClick={() => setImageModal({ isOpen: true, url: `${UPLOADS_URL}${t.buktiUrl}` })} className="px-3 py-1.5 bg-white/10 text-white rounded-md text-xs hover:bg-white/20 transition-colors">Bukti</button>
                        )}
                        <button onClick={() => handleProcessTopUp(t.id, 'approve')} className="px-3 py-1.5 bg-secondary-container/20 text-secondary-container rounded-md text-xs hover:bg-secondary-container/40 transition-colors">Setujui</button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {((activeTab === 'verification' && payments.length === 0) || 
                  (activeTab === 'withdrawals' && withdrawals.length === 0) || 
                  (activeTab === 'topups' && topUps.length === 0) || 
                  activeTab === 'profit') && (
                  <tr>
                    <td colSpan="6" className="px-stack-lg py-8 text-center text-surface-variant/60">
                      {activeTab === 'profit' ? 'Pilih tab untuk melihat antrian transaksi tertunda' : 'Tidak ada transaksi yang menunggu'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image View Modal */}
      {imageModal.isOpen && createPortal(
        <div 
          className="fixed inset-0 bg-[#050811]/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4"
          onClick={() => setImageModal({ isOpen: false, url: '' })}
        >
          <div 
            className="glass-dark rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
              <h3 className="font-bold text-title-sm text-white">Bukti Transfer</h3>
              <button 
                onClick={() => setImageModal({ isOpen: false, url: '' })} 
                className="p-2 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px] block">close</span>
              </button>
            </div>
            <div className="p-4 flex-1 min-h-0 flex items-center justify-center overflow-auto">
              <img src={imageModal.url} alt="Bukti Transfer" className="max-w-full h-auto rounded-lg object-contain shadow-2xl" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminFinance;
