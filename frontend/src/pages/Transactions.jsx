// src/pages/Transactions.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Package, Check, ArrowRight, Star, MessageCircle, UploadCloud, Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import transactionService from '../services/transaction.service';
import reviewService from '../services/review.service';
import * as paymentService from '../services/payment.service';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  WAITING_VERIFICATION: 'bg-purple-100 text-purple-700',
  PAID: 'bg-teal-100 text-teal-700',
  REJECTED: 'bg-red-100 text-red-700',
  BORROWED: 'bg-indigo-100 text-indigo-700',
  WAITING_PENALTY_PAYMENT: 'bg-red-100 text-red-700',
  RETURNED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700'
};

const STATUS_LABELS = {
  PENDING: 'Menunggu Persetujuan',
  APPROVED: 'Menunggu Pembayaran',
  WAITING_VERIFICATION: 'Verifikasi Pembayaran',
  PAID: 'Lunas',
  REJECTED: 'Ditolak',
  BORROWED: 'Sedang Dipinjam',
  WAITING_PENALTY_PAYMENT: 'Bayar Denda',
  RETURNED: 'Dikembalikan',
  COMPLETED: 'Selesai'
};

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('borrowings'); // 'borrowings' | 'requests'
  const [borrowings, setBorrowings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ isOpen: false, txId: null, rating: 5, comment: '' });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, txId: null, file: null });
  const [extendModal, setExtendModal] = useState({ isOpen: false, txId: null, days: 1, reason: '' });
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'borrowings') {
        const res = await transactionService.getMyBorrowings();
        setBorrowings(res.data);
      } else {
        const res = await transactionService.getMyItemRequests();
        setRequests(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeTab]);

  const handleExportInvoicePDF = (tx) => {
    try {
      const doc = new jsPDF();
      const pw = doc.internal.pageSize.width; // 210mm
      const primaryColor = [79, 70, 229];
      const textColor = [51, 65, 85];
      const lightTextColor = [100, 116, 139];
      const margin = 14;
      const colRight = 110; // x start for right column

      // ── Header strip ─────────────────────────────────────
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pw, 15, 'F');

      // Company name & tagline (left, Y=20-33)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('CampusRent', margin, 24);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('Platform Peminjaman Mahasiswa', margin, 30);

      // "INVOICE" title (right, Y=24-32)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('INVOICE', pw - margin, 30, { align: 'right' });

      // ── Invoice meta (right side, Y=40-56) ──────────────
      const labelX = pw - 65;
      const valueX = pw - margin;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('INVOICE #',   labelX, 40);
      doc.text('TANGGAL',     labelX, 47);
      doc.text('JATUH TEMPO', labelX, 54);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(tx.id.substring(0, 8).toUpperCase(),              valueX, 40, { align: 'right' });
      doc.text(new Date(tx.startDate).toLocaleDateString('id-ID'), valueX, 47, { align: 'right' });
      doc.text(new Date(tx.endDate).toLocaleDateString('id-ID'),   valueX, 54, { align: 'right' });

      // ── Thin separator ───────────────────────────────────
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 60, pw - margin, 60);

      // ── Borrower & Owner info side-by-side (Y=65-85) ────
      // Left half = peminjam (X: 14–100)
      // Right half = pemilik (X: 110–196)  — no overlap!
      const peminjamNama  = tx.borrower?.nama     || '-';
      const peminjamEmail = tx.borrower?.email    || '-';
      const peminjamWA    = tx.borrower?.whatsapp || '-';
      const peminjamNIM   = tx.borrower?.nim      || '-';
      const pemilikNama   = tx.item?.owner?.nama  || '-';
      const pemilikEmail  = tx.item?.owner?.email || '-';
      const pemilikWA     = tx.item?.owner?.whatsapp || '-';

      doc.setFontSize(8);

      // Peminjam (left)
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('DITAGIHKAN KEPADA:', margin, 66);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(peminjamNama, margin, 72);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text(`Email : ${peminjamEmail}`, margin, 78);
      doc.text(`WA    : ${peminjamWA}`,    margin, 84);
      doc.text(`NIM   : ${peminjamNIM}`,   margin, 90);

      // Pemilik Barang (right column, starting X=110)
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('PEMILIK BARANG:', colRight, 66);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(pemilikNama, colRight, 72);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text(`Email : ${pemilikEmail}`, colRight, 78);
      doc.text(`WA    : ${pemilikWA}`,    colRight, 84);

      // ── Divider before table ─────────────────────────────
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 96, pw - margin, 96);

      // ── Tabel ───────────────────────────────────────────
      const durasi = Math.ceil((new Date(tx.endDate) - new Date(tx.startDate)) / (1000 * 60 * 60 * 24));
      const hargaPerHari = durasi > 0 ? Math.round(tx.totalPrice / durasi) : tx.totalPrice;

      autoTable(doc, {
        startY: 100,
        head: [['DESKRIPSI', 'DURASI', 'HARGA/HARI', 'TOTAL']],
        body: [[
          tx.item.namaBarang,
          `${durasi} Hari`,
          `Rp ${hargaPerHari.toLocaleString('id-ID')}`,
          `Rp ${tx.totalPrice.toLocaleString('id-ID')}`
        ]],
        theme: 'plain',
        headStyles: { fillColor: primaryColor, textColor: [255,255,255], fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { textColor: textColor, fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 85 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'right',  cellWidth: 35 },
          3: { halign: 'right',  cellWidth: 35, fontStyle: 'bold' }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      // ── Ringkasan biaya (kanan bawah) ───────────────────
      const fy = doc.lastAutoTable?.finalY || 130;

      // Label kolom — cukup lebar agar tidak tabrakan dengan nilai
      const sumLabelX = pw - 75;
      const sumValueX = pw - margin;

      const adminFee = 5000;
      const subtotal = tx.totalPrice - adminFee;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('SUBTOTAL',     sumLabelX, fy + 14);
      doc.text('DISKON',       sumLabelX, fy + 21);
      doc.text('BIAYA LAYANAN',sumLabelX, fy + 28);

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`Rp ${subtotal.toLocaleString('id-ID')}`, sumValueX, fy + 14, { align: 'right' });
      doc.text('Rp 0', sumValueX, fy + 21, { align: 'right' });
      doc.text(`Rp ${adminFee.toLocaleString('id-ID')}`, sumValueX, fy + 28, { align: 'right' });

      // Garis tipis pemisah
      doc.setDrawColor(226, 232, 240);
      doc.line(sumLabelX - 2, fy + 31, pw - margin, fy + 31);

      // TOTAL DIBAYAR — label kiri, nilai kanan, baris berbeda agar tidak tumpuk
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('TOTAL DIBAYAR', sumLabelX, fy + 39);
      doc.text(`Rp ${tx.totalPrice.toLocaleString('id-ID')}`, sumValueX, fy + 39, { align: 'right' });

      // LUNAS stamp — green filled badge
      const badgeW = 32;
      const badgeH = 10;
      const badgeX = sumValueX - badgeW;
      const badgeY = fy + 43;
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('LUNAS', badgeX + badgeW / 2, badgeY + 7, { align: 'center' });

      // ── Tanda Tangan ────────────────────────────────────
      const sigY = fy + 65; // mulai di bawah ringkasan biaya

      // Kota & tanggal
      const today = new Date();
      const tanggalCetak = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text(`Dicetak pada: ${tanggalCetak}`, margin, sigY - 8);

      // Kolom kiri — Peminjam
      const sigLeftX  = margin + 10;
      const sigRightX = pw / 2 + 15;
      const lineLen   = 55;
      const sigLineY  = sigY + 22;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('Peminjam,', sigLeftX, sigY);

      // Kolom kanan — Pemilik Barang
      doc.text('Pemilik Barang,', sigRightX, sigY);

      // Garis tanda tangan
      doc.setDrawColor(textColor[0], textColor[1], textColor[2]);
      doc.setLineWidth(0.3);
      doc.line(sigLeftX,  sigLineY, sigLeftX  + lineLen, sigLineY);
      doc.line(sigRightX, sigLineY, sigRightX + lineLen, sigLineY);

      // Nama di bawah garis
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`( ${peminjamNama} )`, sigLeftX + lineLen / 2, sigLineY + 5, { align: 'center' });
      doc.text(`( ${pemilikNama} )`,  sigRightX + lineLen / 2, sigLineY + 5, { align: 'center' });

      // Footer kiri
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('Terima kasih telah menggunakan layanan CampusRent.', margin, fy + 39);
      doc.text('Simpan dokumen ini sebagai bukti transaksi resmi.', margin, fy + 46);

      // Bottom accent strip
      doc.setFillColor(16, 185, 129);
      doc.rect(0, doc.internal.pageSize.height - 5, pw, 5, 'F');

      doc.save(`Invoice_${tx.id}.pdf`);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mencetak PDF: ' + err.message);
    }
  };

  const handleUpdateStatus = async (id, status, role) => {
    try {
      if (role === 'owner') {
        await transactionService.updateRequestStatus(id, status);
      } else if (role === 'borrower') {
        await transactionService.updateBorrowStatus(id, status);
      }
      toast.success(`Status berhasil diubah menjadi ${STATUS_LABELS[status]}`);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const handleExportExcel = () => {
    try {
      const isBorrower = activeTab === 'borrowings';
      const dataToExport = isBorrower ? borrowings : requests;
      
      if (dataToExport.length === 0) {
        toast.error('Tidak ada data untuk diekspor');
        return;
      }

      const formattedData = dataToExport.map(tx => ({
        'No. Transaksi': tx.id.substring(0, 8).toUpperCase(),
        'Tanggal Mulai': new Date(tx.startDate).toLocaleDateString('id-ID'),
        'Tanggal Selesai': new Date(tx.endDate).toLocaleDateString('id-ID'),
        'Nama Barang': tx.item.namaBarang,
        [isBorrower ? 'Pemilik Barang' : 'Peminjam']: isBorrower ? tx.item.owner.nama : tx.borrower?.nama || '-',
        'Harga Total': `Rp ${tx.totalPrice.toLocaleString('id-ID')}`,
        'Status': STATUS_LABELS[tx.status]
      }));

      const ws = XLSX.utils.json_to_sheet(formattedData);
      
      // Auto-size columns
      const colWidths = [
        { wch: 15 }, // No. Transaksi
        { wch: 15 }, // Tanggal Mulai
        { wch: 15 }, // Tanggal Selesai
        { wch: 25 }, // Nama Barang
        { wch: 20 }, // Pihak Lain
        { wch: 15 }, // Harga
        { wch: 20 }, // Status
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
      
      const fileName = `Rekap_${isBorrower ? 'Peminjaman' : 'Permintaan'}_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Berhasil mengekspor data ke Excel');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Gagal mengekspor data');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await reviewService.createReview({
        transactionId: reviewModal.txId,
        rating: reviewModal.rating,
        comment: reviewModal.comment
      });
      toast.success('Ulasan berhasil dikirim');
      setReviewModal({ isOpen: false, txId: null, rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim ulasan');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentModal.file) {
      return toast.error('Silakan pilih file bukti pembayaran');
    }
    
    try {
      toast.loading('Mengunggah bukti pembayaran...', { id: 'payment' });
      await paymentService.uploadPaymentProof(paymentModal.txId, paymentModal.file);
      toast.success('Bukti pembayaran berhasil diunggah', { id: 'payment' });
      setPaymentModal({ isOpen: false, txId: null, file: null });
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengunggah bukti pembayaran', { id: 'payment' });
    }
  };

  const handleRequestExtension = async (e) => {
    e.preventDefault();
    if (extendModal.days < 1) return toast.error('Jumlah hari tidak valid');

    try {
      toast.loading('Mengajukan perpanjangan...', { id: 'extend' });
      await transactionService.requestExtension(extendModal.txId, {
        days: extendModal.days,
        reason: extendModal.reason
      });
      toast.success('Pengajuan perpanjangan berhasil dikirim', { id: 'extend' });
      setExtendModal({ isOpen: false, txId: null, days: 1, reason: '' });
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengajukan perpanjangan', { id: 'extend' });
    }
  };

  const handleRespondExtension = async (txId, extendId, status) => {
    try {
      toast.loading('Memproses...', { id: 'respond-extend' });
      await transactionService.respondExtension(txId, extendId, status);
      toast.success(`Perpanjangan berhasil ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`, { id: 'respond-extend' });
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses respon perpanjangan', { id: 'respond-extend' });
    }
  };

  const handlePayPenalty = async (txId) => {
    try {
      toast.loading('Memproses pembayaran denda...', { id: 'pay-penalty' });
      await transactionService.payPenalty(txId);
      toast.success('Denda berhasil dibayar. Status berubah menjadi Dikembalikan.', { id: 'pay-penalty' });
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membayar denda', { id: 'pay-penalty' });
    }
  };

  const renderTransactionCard = (tx, isOwnerView) => {
    const item = tx.item;
    const partner = isOwnerView ? tx.borrower : item.owner;

    return (
      <div key={tx.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4 flex flex-col md:flex-row gap-6">
        <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
          {item.fotoBarang ? (
            <img src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} alt={item.namaBarang} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400"><Package /></div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <Link to={`/items/${item.id}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
                {item.namaBarang}
              </Link>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${STATUS_COLORS[tx.status]}`}>
                {STATUS_LABELS[tx.status]}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-2">
              {new Date(tx.startDate).toLocaleDateString('id-ID')} - {new Date(tx.endDate).toLocaleDateString('id-ID')}
            </p>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                {partner.nama.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600">
                {isOwnerView ? 'Peminjam: ' : 'Pemilik: '} <span className="font-semibold">{partner.nama}</span>
              </span>
              {(tx.status === 'APPROVED' || tx.status === 'PAID' || tx.status === 'BORROWED' || tx.status === 'RETURNED' || tx.status === 'COMPLETED') && (
                <button 
                  onClick={() => navigate('/chat', { state: { selectedUser: partner } })}
                  className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md ml-2 hover:bg-blue-100 flex items-center gap-1 transition-colors font-medium"
                >
                  <MessageCircle size={12} /> Chat
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">
                {tx.totalPrice === 0 ? 'Gratis' : `Rp ${tx.totalPrice.toLocaleString('id-ID')}`}
              </span>
              {tx.lateFee > 0 && (
                <span className="text-sm font-semibold text-red-600">
                  Denda: Rp {tx.lateFee.toLocaleString('id-ID')}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              {isOwnerView ? (
                <>
                  {tx.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleUpdateStatus(tx.id, 'REJECTED', 'owner')} className="btn-secondary px-4 py-1.5 text-sm flex items-center gap-1 text-red-600 hover:bg-red-50">
                        <XCircle size={14} /> Tolak
                      </button>
                      <button onClick={() => handleUpdateStatus(tx.id, 'APPROVED', 'owner')} className="btn-primary px-4 py-1.5 text-sm flex items-center gap-1">
                        <CheckCircle size={14} /> Setujui
                      </button>
                    </>
                  )}
                  {tx.status === 'RETURNED' && (
                    <button onClick={() => handleUpdateStatus(tx.id, 'COMPLETED', 'owner')} className="btn-primary px-4 py-1.5 text-sm flex items-center gap-1 bg-green-600 hover:bg-green-700">
                      <Check size={14} /> Selesaikan
                    </button>
                  )}
                  {tx.status === 'COMPLETED' && (
                    <button onClick={() => setReviewModal({ isOpen: true, txId: tx.id, rating: 5, comment: '' })} className="btn-secondary border border-yellow-200 px-4 py-1.5 text-sm flex items-center gap-1 text-yellow-600 hover:bg-yellow-50 bg-white">
                      <Star size={14} className="fill-current" /> Beri Ulasan
                    </button>
                  )}
                  {tx.extensions?.filter(ext => ext.status === 'PENDING').map(ext => (
                    <div key={ext.id} className="flex flex-col gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg ml-2">
                      <div className="text-xs text-yellow-800 font-medium">Pengajuan Perpanjangan: {ext.days} hari</div>
                      <div className="flex gap-2">
                        <button onClick={() => handleRespondExtension(tx.id, ext.id, 'REJECTED')} className="px-3 py-1 bg-white text-red-600 text-xs border border-red-200 hover:bg-red-50 rounded-md">Tolak</button>
                        <button onClick={() => handleRespondExtension(tx.id, ext.id, 'APPROVED')} className="px-3 py-1 bg-white text-green-600 text-xs border border-green-200 hover:bg-green-50 rounded-md">Terima</button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {tx.status === 'APPROVED' && (
                    <button onClick={() => setPaymentModal({ isOpen: true, txId: tx.id, file: null })} className="btn-primary px-4 py-1.5 text-sm flex items-center gap-1">
                      <ArrowRight size={14} /> Bayar Sekarang
                    </button>
                  )}
                  {tx.status === 'PAID' && (
                    <button onClick={() => handleUpdateStatus(tx.id, 'BORROWED', 'borrower')} className="btn-primary px-4 py-1.5 text-sm flex items-center gap-1">
                      <ArrowRight size={14} /> Ambil Barang
                    </button>
                  )}
                  {tx.status === 'BORROWED' && (
                    <div className="flex gap-2">
                      {tx.extensions?.some(ext => ext.status === 'PENDING') ? (
                        <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs rounded-lg font-medium flex items-center">
                          Menunggu Konfirmasi Perpanjangan
                        </span>
                      ) : (
                        <button onClick={() => setExtendModal({ isOpen: true, txId: tx.id, days: 1, reason: '' })} className="btn-secondary px-4 py-1.5 text-sm flex items-center gap-1 text-indigo-600 hover:bg-indigo-50">
                          <Clock size={14} /> Ajukan Perpanjangan
                        </button>
                      )}
                      <button onClick={() => handleUpdateStatus(tx.id, 'RETURNED', 'borrower')} className="btn-secondary px-4 py-1.5 text-sm flex items-center gap-1 text-orange-600 hover:bg-orange-50">
                        <Package size={14} /> Kembalikan Barang
                      </button>
                    </div>
                  )}
                  {tx.status === 'WAITING_PENALTY_PAYMENT' && (
                    <button onClick={() => handlePayPenalty(tx.id)} className="btn-primary px-4 py-1.5 text-sm flex items-center gap-1 bg-red-600 hover:bg-red-700">
                      <CheckCircle size={14} /> Bayar Denda
                    </button>
                  )}
                  {tx.status === 'COMPLETED' && (
                    <button onClick={() => setReviewModal({ isOpen: true, txId: tx.id, rating: 5, comment: '' })} className="btn-secondary border border-yellow-200 px-4 py-1.5 text-sm flex items-center gap-1 text-yellow-600 hover:bg-yellow-50 bg-white">
                      <Star size={14} className="fill-current" /> Beri Ulasan
                    </button>
                  )}
                  {['PAID', 'BORROWED', 'RETURNED', 'COMPLETED'].includes(tx.status) && (
                    <button onClick={() => handleExportInvoicePDF(tx)} className="btn-secondary border border-blue-200 px-4 py-1.5 text-sm flex items-center gap-1 text-blue-600 hover:bg-blue-50 bg-white">
                      <Printer size={14} /> Cetak Invoice
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Transaksi</h1>
        
        {/* Tabs */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200">
          <div className="flex gap-4">
            <button 
              className={`pb-3 font-semibold transition-colors relative ${activeTab === 'borrowings' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('borrowings')}
            >
              Peminjaman Saya
              {activeTab === 'borrowings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
            </button>
            <button 
              className={`pb-3 font-semibold transition-colors relative ${activeTab === 'requests' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('requests')}
            >
              Permintaan Masuk
              {activeTab === 'requests' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
            </button>
          </div>
          
          <button 
            onClick={handleExportExcel}
            className="btn-secondary mb-3 px-4 py-1.5 text-sm flex items-center gap-2 text-emerald-600 border border-emerald-200 hover:bg-emerald-50 bg-white"
          >
            <Download size={16} />
            Export Excel
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'borrowings' ? (
          borrowings.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Belum ada peminjaman.</div>
          ) : (
            borrowings.map(tx => renderTransactionCard(tx, false))
          )
        ) : (
          requests.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Belum ada permintaan masuk.</div>
          ) : (
            requests.map(tx => renderTransactionCard(tx, true))
          )
        )}
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Beri Ulasan</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewModal({ ...reviewModal, rating: star })}
                      className={`p-2 rounded-xl transition-all ${reviewModal.rating >= star ? 'text-yellow-400 bg-yellow-50' : 'text-gray-300 hover:bg-gray-50'}`}
                    >
                      <Star size={28} className={reviewModal.rating >= star ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Komentar (Opsional)</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                  placeholder="Bagaimana pengalaman Anda?"
                  value={reviewModal.comment}
                  onChange={(e) => setReviewModal({ ...reviewModal, comment: e.target.value })}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModal({ isOpen: false, txId: null, rating: 5, comment: '' })}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Kirim Ulasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Sewa</h3>
            <p className="text-sm text-gray-500 mb-6">Silakan unggah bukti transfer ke rekening Admin CampusRent.</p>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
              <p className="text-sm text-blue-800 font-medium mb-1">Transfer ke Rekening Bersama:</p>
              <p className="text-lg font-bold text-blue-900 tracking-wider">BCA - 1234567890</p>
              <p className="text-sm text-blue-700">a.n Admin CampusRent</p>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Bukti Transfer</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-blue-500 transition-colors"
                >
                  {paymentModal.file ? (
                    <div className="text-center px-4">
                      <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                      <p className="text-sm font-medium text-gray-900 truncate">{paymentModal.file.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-sm font-medium">Klik untuk upload foto</p>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setPaymentModal({ ...paymentModal, file: e.target.files[0] });
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentModal({ isOpen: false, txId: null, file: null })}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <ArrowRight size={18} /> Kirim Bukti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {extendModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ajukan Perpanjangan Waktu</h3>
            <form onSubmit={handleRequestExtension}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tambah Durasi (Hari)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={extendModal.days}
                  onChange={(e) => setExtendModal({ ...extendModal, days: e.target.value })}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Alasan (Opsional)</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                  placeholder="Kenapa Anda butuh perpanjangan waktu?"
                  value={extendModal.reason}
                  onChange={(e) => setExtendModal({ ...extendModal, reason: e.target.value })}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setExtendModal({ isOpen: false, txId: null, days: 1, reason: '' })}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
