import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import transactionService from '../services/transaction.service';
import reviewService from '../services/review.service';
import * as paymentService from '../services/payment.service';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const STATUS_COLORS = {
 PENDING: 'bg-tertiary-fixed-dim/20 text-tertiary border-tertiary-fixed-dim/30',
 APPROVED: 'bg-primary-container/30 text-primary border-primary-container/50',
 WAITING_VERIFICATION: 'bg-surface-variant/50 text-on-surface-variant border-outline-variant/30',
 PAID: 'bg-secondary-container/30 text-secondary border-secondary-container/50',
 REJECTED: 'bg-error-container/30 text-error border-error-container/50',
 BORROWED: 'bg-primary/20 text-primary border-primary/30',
 WAITING_PENALTY_PAYMENT: 'bg-error/20 text-error border-error/30',
 RETURNED: 'bg-secondary-fixed/30 text-secondary-fixed-dim border-secondary-fixed/50',
 COMPLETED: 'bg-secondary/20 text-secondary border-secondary/30'
};

const STATUS_LABELS = {
 PENDING: 'PENDING',
 APPROVED: 'DISETUJUI',
 WAITING_VERIFICATION: 'VERIFIKASI',
 PAID: 'LUNAS',
 REJECTED: 'DITOLAK',
 BORROWED: 'DIPINJAM',
 WAITING_PENALTY_PAYMENT: 'DENDA',
 RETURNED: 'DIKEMBALIKAN',
 COMPLETED: 'SELESAI'
};

const Transactions = () => {
 const { user } = useAuth();
 const [activeTab, setActiveTab] = useState('borrowings'); // 'borrowings' | 'requests'
 const [borrowings, setBorrowings] = useState([]);
 const [requests, setRequests] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [visibleCount, setVisibleCount] = useState(5);
 const [filterMonth, setFilterMonth] = useState('');
 const [reviewModal, setReviewModal] = useState({ isOpen: false, txId: null, rating: 5, comment: '' });
 const [paymentModal, setPaymentModal] = useState({ isOpen: false, txId: null, file: null, amount: 0 });
 const [extendModal, setExtendModal] = useState({ isOpen: false, txId: null, days: 1, reason: '' });
 const navigate = useNavigate();
 const fileInputRef = useRef(null);

 const fetchTransactions = useCallback(async () => {
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
   console.error(err);
   toast.error('Gagal memuat transaksi');
  } finally {
   setIsLoading(false);
  }
 }, [activeTab]);

 useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchTransactions();
 }, [fetchTransactions]);

 useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setVisibleCount(5);
 }, [activeTab, filterMonth]);

 const handleExportInvoicePDF = (tx) => {
  try {
   const doc = new jsPDF();
   const pw = doc.internal.pageSize.width; // 210mm
   const primaryColor = [0, 74, 198]; // primary
   const textColor = [11, 28, 48]; // on-surface
   const lightTextColor = [67, 70, 85]; // on-surface-variant
   const margin = 14;
   const colRight = 110; 

   doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
   doc.rect(0, 0, pw, 15, 'F');

   doc.setFont('helvetica', 'bold');
   doc.setFontSize(14);
   doc.setTextColor(30, 41, 59);
   doc.text('CampusRent', margin, 24);
   doc.setFont('helvetica', 'normal');
   doc.setFontSize(9);
   doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
   doc.text('Platform Peminjaman Mahasiswa', margin, 30);

   doc.setFont('helvetica', 'bold');
   doc.setFontSize(26);
   doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
   doc.text('INVOICE', pw - margin, 30, { align: 'right' });

   const labelX = pw - 65;
   const valueX = pw - margin;
   doc.setFontSize(9);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
   doc.text('INVOICE #', labelX, 40);
   doc.text('TANGGAL', labelX, 47);
   doc.text('JATUH TEMPO', labelX, 54);
   doc.setFont('helvetica', 'bold');
   doc.setTextColor(textColor[0], textColor[1], textColor[2]);
   doc.text(tx.id.substring(0, 8).toUpperCase(), valueX, 40, { align: 'right' });
   doc.text(new Date(tx.startDate).toLocaleDateString('id-ID'), valueX, 47, { align: 'right' });
   doc.text(new Date(tx.endDate).toLocaleDateString('id-ID'), valueX, 54, { align: 'right' });

   doc.setDrawColor(226, 232, 240);
   doc.line(margin, 60, pw - margin, 60);

   const peminjamNama = tx.borrower?.nama || '-';
   const peminjamEmail = tx.borrower?.email || '-';
   const peminjamWA = tx.borrower?.whatsapp || '-';
   const peminjamNIM = tx.borrower?.nim || '-';
   const pemilikNama = tx.item?.owner?.nama || '-';
   const pemilikEmail = tx.item?.owner?.email || '-';
   const pemilikWA = tx.item?.owner?.whatsapp || '-';

   doc.setFontSize(8);

   doc.setFont('helvetica', 'bold');
   doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
   doc.text('DITAGIHKAN KEPADA:', margin, 66);
   doc.setTextColor(textColor[0], textColor[1], textColor[2]);
   doc.text(peminjamNama, margin, 72);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
   doc.text(`Email : ${peminjamEmail}`, margin, 78);
   doc.text(`WA : ${peminjamWA}`, margin, 84);
   doc.text(`NIM : ${peminjamNIM}`, margin, 90);

   doc.setFont('helvetica', 'bold');
   doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
   doc.text('PEMILIK BARANG:', colRight, 66);
   doc.setTextColor(textColor[0], textColor[1], textColor[2]);
   doc.text(pemilikNama, colRight, 72);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
   doc.text(`Email : ${pemilikEmail}`, colRight, 78);
   doc.text(`WA : ${pemilikWA}`, colRight, 84);

   doc.setDrawColor(226, 232, 240);
   doc.line(margin, 96, pw - margin, 96);

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
     2: { halign: 'right', cellWidth: 35 },
     3: { halign: 'right', cellWidth: 35, fontStyle: 'bold' }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
   });

   const fy = doc.lastAutoTable?.finalY || 130;

   const sumLabelX = pw - 75;
   const sumValueX = pw - margin;

   const adminFee = 5000;
   const subtotal = tx.totalPrice > 0 ? tx.totalPrice - adminFee : 0;

   doc.setFontSize(9);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
   doc.text('SUBTOTAL', sumLabelX, fy + 14);
   doc.text('DISKON', sumLabelX, fy + 21);
   doc.text('BIAYA LAYANAN',sumLabelX, fy + 28);

   doc.setTextColor(textColor[0], textColor[1], textColor[2]);
   doc.text(`Rp ${subtotal.toLocaleString('id-ID')}`, sumValueX, fy + 14, { align: 'right' });
   doc.text('Rp 0', sumValueX, fy + 21, { align: 'right' });
   doc.text(`Rp ${adminFee.toLocaleString('id-ID')}`, sumValueX, fy + 28, { align: 'right' });

   doc.setDrawColor(226, 232, 240);
   doc.line(sumLabelX - 2, fy + 31, pw - margin, fy + 31);

   doc.setFont('helvetica', 'bold');
   doc.setFontSize(11);
   doc.setTextColor(textColor[0], textColor[1], textColor[2]);
   doc.text('TOTAL DIBAYAR', sumLabelX, fy + 39);
   doc.text(`Rp ${tx.totalPrice.toLocaleString('id-ID')}`, sumValueX, fy + 39, { align: 'right' });

   const badgeW = 32;
   const badgeH = 10;
   const badgeX = sumValueX - badgeW;
   const badgeY = fy + 43;
   doc.setFillColor(16, 185, 129); 
   doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, 'F');
   doc.setFontSize(10);
   doc.setFont('helvetica', 'bold');
   doc.setTextColor(255, 255, 255);
   doc.text('LUNAS', badgeX + badgeW / 2, badgeY + 7, { align: 'center' });

   const sigY = fy + 65; 

   const today = new Date();
   const tanggalCetak = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
   doc.setFont('helvetica', 'normal');
   doc.setFontSize(9);
   doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
   doc.text(`Dicetak pada: ${tanggalCetak}`, margin, sigY - 8);

   const sigLeftX = margin + 10;
   const sigRightX = pw / 2 + 15;
   const lineLen = 55;
   const sigLineY = sigY + 22;

   doc.setFont('helvetica', 'normal');
   doc.setFontSize(9);
   doc.setTextColor(textColor[0], textColor[1], textColor[2]);
   doc.text('Peminjam,', sigLeftX, sigY);
   doc.text('Pemilik Barang,', sigRightX, sigY);

   doc.setDrawColor(textColor[0], textColor[1], textColor[2]);
   doc.setLineWidth(0.3);
   doc.line(sigLeftX, sigLineY, sigLeftX + lineLen, sigLineY);
   doc.line(sigRightX, sigLineY, sigRightX + lineLen, sigLineY);

   doc.setFont('helvetica', 'bold');
   doc.setFontSize(9);
   doc.text(`( ${peminjamNama} )`, sigLeftX + lineLen / 2, sigLineY + 5, { align: 'center' });
   doc.text(`( ${pemilikNama} )`, sigRightX + lineLen / 2, sigLineY + 5, { align: 'center' });

   doc.setFont('helvetica', 'normal');
   doc.setFontSize(8);
   doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
   doc.text('Terima kasih telah menggunakan layanan CampusRent.', margin, fy + 39);
   doc.text('Simpan dokumen ini sebagai bukti transaksi resmi.', margin, fy + 46);

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
   
   const colWidths = [
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
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
   setPaymentModal({ isOpen: false, txId: null, file: null, amount: 0 });
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

 // Kalkulasi summary widget
 const activeBorrowings = borrowings.filter(tx => ['APPROVED', 'PAID', 'BORROWED'].includes(tx.status)).length;
 const pendingRequests = requests.filter(tx => tx.status === 'PENDING').length;
 const completedThisMonth = [...borrowings, ...requests].filter(tx => {
     if (tx.status !== 'COMPLETED' && tx.status !== 'RETURNED') return false;
     const endDate = new Date(tx.endDate);
     const now = new Date();
     return endDate.getMonth() === now.getMonth() && endDate.getFullYear() === now.getFullYear();
 }).length;
 const needsAction = borrowings.filter(tx => tx.status === 'WAITING_PENALTY_PAYMENT').length + 
                    requests.filter(tx => tx.status === 'WAITING_VERIFICATION' || tx.status === 'RETURNED').length +
                    borrowings.filter(tx => tx.status === 'APPROVED').length;

 const activeData = activeTab === 'borrowings' ? borrowings : requests;
 const filteredData = activeData.filter(tx => {
  if (!filterMonth) return true;
  const txDate = new Date(tx.createdAt);
  const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
  return txMonth === filterMonth;
 });
 const displayedData = filteredData.slice(0, visibleCount);

 const renderTransactionCard = (tx, isOwnerView) => {
  const item = tx.item;
  const partner = isOwnerView ? tx.borrower : item.owner;
  const durasi = Math.ceil((new Date(tx.endDate) - new Date(tx.startDate)) / (1000 * 60 * 60 * 24));
  
  // Custom styling for specific status (like APPROVED in the mock)
  const isApproved = tx.status === 'APPROVED' && !isOwnerView;
  const cardClasses = isApproved 
    ? "glass-panel rounded-xl p-stack-md flex flex-col sm:flex-row gap-stack-md premium-shadow hover:-translate-y-1 transition-transform border border-primary/20 bg-primary/5"
    : "glass-panel rounded-xl p-stack-md flex flex-col sm:flex-row gap-stack-md premium-shadow hover:-translate-y-1 transition-transform";

  return (
   <div key={tx.id} className={cardClasses}>
    <div className="w-full sm:w-40 h-40 rounded-lg overflow-hidden shrink-0 border border-outline-variant/10 relative">
     {isApproved && (
        <span className="absolute top-2 right-2 px-2 py-1 bg-primary text-white text-[10px] font-bold rounded shadow-md z-10">SIAP DIBAYAR</span>
     )}
     {item.fotoBarang ? (
      <img src={`${UPLOADS_URL}${item.fotoBarang.split(',')[0]}`} alt={item.namaBarang} className="w-full h-full object-cover" />
     ) : (
      <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-surface-variant">
       <span className="material-symbols-outlined text-[32px]">inventory_2</span>
      </div>
     )}
    </div>
    
    <div className="flex-1 flex flex-col justify-between gap-stack-sm">
     <div>
      <div className="flex justify-between items-start gap-4 mb-2">
       <div>
        <Link to={`/items/${item.id}`} className="font-title-md text-title-md font-bold hover:text-primary transition-colors line-clamp-2">
         {item.namaBarang}
        </Link>
        <span className="inline-block px-2 py-0.5 mt-1 bg-surface-container text-on-surface-variant text-[10px] rounded-full border border-outline-variant/30">
            Kondisi: Baik
        </span>
       </div>
       <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase shrink-0 border ${STATUS_COLORS[tx.status]}`}>
        {STATUS_LABELS[tx.status]}
       </span>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
       {partner?.fotoProfil ? (
           <img className="w-6 h-6 rounded-full object-cover border border-outline-variant/20" src={`${UPLOADS_URL}${partner.fotoProfil}`} alt={partner?.nama} />
       ) : (
           <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 border border-outline-variant/20">
            {partner?.nama?.charAt(0)?.toUpperCase()}
           </div>
       )}
       <span className="font-label-sm text-label-sm text-on-surface-variant">
        {isOwnerView ? 'Peminjam' : 'Pemilik'}: {partner?.nama}
       </span>
       {partner?.isVerified && (
           <span className="material-symbols-outlined text-secondary text-sm" title="Terverifikasi">verified</span>
       )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-2">
       <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-md">
           <span className="material-symbols-outlined text-sm">calendar_today</span> 
           {new Date(tx.startDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})} - {new Date(tx.endDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})} ({durasi} Hari)
       </p>
       {isApproved ? (
           <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-md">
               <span className="material-symbols-outlined text-sm">timer</span> Segera bayar
           </p>
       ) : (
           <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-md">
               <span className="material-symbols-outlined text-sm">schedule</span> Dipesan: {new Date(tx.createdAt).toLocaleString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}
           </p>
       )}
      </div>
     </div>
     
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2 pt-4 border-t border-outline-variant/10">
      <div className="shrink-0 min-w-fit">
       <span className="font-label-sm text-[11px] text-outline block uppercase tracking-wider">Total Harga</span>
       <span className="font-title-md text-lg font-bold text-primary whitespace-nowrap block">
        {tx.totalPrice === 0 ? 'Gratis' : `Rp ${tx.totalPrice.toLocaleString('id-ID')}`}
       </span>
       {tx.lateFee > 0 && (
        <span className="font-label-sm text-[12px] block font-semibold text-error mt-1 whitespace-nowrap">
         Denda: Rp {tx.lateFee.toLocaleString('id-ID')}
        </span>
       )}
      </div>
      
      <div className="flex-1 flex flex-row flex-wrap gap-2 w-full justify-start sm:justify-end items-center">
       {(tx.status === 'APPROVED' || tx.status === 'PAID' || tx.status === 'BORROWED' || tx.status === 'RETURNED' || tx.status === 'COMPLETED') && (
        <button 
         onClick={() => navigate('/chat', { state: { selectedUser: partner } })}
         className="px-4 py-2 bg-surface hover:bg-surface-variant border border-outline-variant/30 rounded-lg transition-colors font-label-md text-label-md flex items-center justify-center gap-2 text-on-surface"
        >
         <span className="material-symbols-outlined text-[18px]">chat</span> Chat
        </button>
       )}

       {isOwnerView ? (
        <>
         {tx.status === 'PENDING' && (
          <>
           <button onClick={() => handleUpdateStatus(tx.id, 'REJECTED', 'owner')} className="px-4 py-2 bg-surface hover:bg-surface-variant border border-outline-variant/30 rounded-lg transition-colors font-label-md text-label-md flex items-center justify-center gap-2 text-error hover:text-error">
            <span className="material-symbols-outlined text-[18px]">cancel</span> Tolak
           </button>
           <button onClick={() => handleUpdateStatus(tx.id, 'APPROVED', 'owner')} className="px-6 py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-lg font-label-md font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span> Setujui
           </button>
          </>
         )}
         {tx.status === 'RETURNED' && (
          <button onClick={() => handleUpdateStatus(tx.id, 'COMPLETED', 'owner')} className="px-6 py-2 bg-secondary text-on-secondary rounded-lg font-label-md font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2">
           <span className="material-symbols-outlined text-[18px]">task_alt</span> Selesaikan
          </button>
         )}
         {tx.status === 'COMPLETED' && (
          <button onClick={() => setReviewModal({ isOpen: true, txId: tx.id, rating: 5, comment: '' })} className="px-4 py-2 bg-surface hover:bg-surface-variant border border-outline-variant/30 rounded-lg transition-colors font-label-md text-label-md flex items-center justify-center gap-2 text-tertiary">
           <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>star</span> Ulas
          </button>
         )}
         {tx.extensions?.filter(ext => ext.status === 'PENDING').map(ext => (
          <div key={ext.id} className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 p-2 bg-tertiary-container/10 border border-tertiary-container/30 rounded-lg mt-2 col-span-full">
           <div className="text-[12px] text-tertiary font-medium">Pengajuan Perpanjangan: {ext.days} hari</div>
           <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => handleRespondExtension(tx.id, ext.id, 'REJECTED')} className="px-3 py-1 bg-surface text-error text-[12px] border border-error/30 hover:bg-error/10 rounded-md">Tolak</button>
            <button onClick={() => handleRespondExtension(tx.id, ext.id, 'APPROVED')} className="px-3 py-1 bg-surface text-secondary text-[12px] border border-secondary/30 hover:bg-secondary/10 rounded-md">Terima</button>
           </div>
          </div>
         ))}
        </>
       ) : (
        <>
         {tx.status === 'PENDING' && (
             <button className="px-4 py-2 bg-surface-container-low text-on-surface-variant rounded-lg cursor-not-allowed font-label-md text-label-md opacity-70" disabled>
                 Menunggu Persetujuan
             </button>
         )}
         {tx.status === 'APPROVED' && (
          <button 
           onClick={() => setPaymentModal({ isOpen: true, txId: tx.id, file: null, amount: tx.totalPrice })} 
           className="px-6 py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-lg font-label-md font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
           <span className="material-symbols-outlined text-[18px]">payment</span> Bayar Sekarang
          </button>
         )}
         {tx.status === 'PAID' && (
          <button onClick={() => handleUpdateStatus(tx.id, 'BORROWED', 'borrower')} className="px-6 py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-lg font-label-md font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2">
           <span className="material-symbols-outlined text-[18px]">local_mall</span> Ambil Barang
          </button>
         )}
         {tx.status === 'BORROWED' && (
          <>
           {tx.extensions?.some(ext => ext.status === 'PENDING') ? (
            <span className="px-4 py-2 bg-tertiary-container/20 text-tertiary text-[12px] rounded-lg font-medium flex items-center justify-center">
             Menunggu Konfirmasi
            </span>
           ) : (
            <button onClick={() => setExtendModal({ isOpen: true, txId: tx.id, days: 1, reason: '' })} className="px-4 py-2 bg-surface hover:bg-surface-variant border border-outline-variant/30 rounded-lg transition-colors font-label-md text-label-md flex items-center justify-center gap-2 text-on-surface">
             <span className="material-symbols-outlined text-[18px]">more_time</span> Perpanjang
            </button>
           )}
           <button onClick={() => handleUpdateStatus(tx.id, 'RETURNED', 'borrower')} className="px-6 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-lg font-label-md font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">assignment_return</span> Kembalikan
           </button>
          </>
         )}
         {tx.status === 'WAITING_PENALTY_PAYMENT' && (
          <button onClick={() => handlePayPenalty(tx.id)} className="px-6 py-2 bg-error text-on-error hover:bg-error/90 rounded-lg font-label-md font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2">
           <span className="material-symbols-outlined text-[18px]">warning</span> Bayar Denda
          </button>
         )}
         {tx.status === 'COMPLETED' && (
          <button onClick={() => setReviewModal({ isOpen: true, txId: tx.id, rating: 5, comment: '' })} className="px-4 py-2 bg-surface hover:bg-surface-variant border border-outline-variant/30 rounded-lg transition-colors font-label-md text-label-md flex items-center justify-center gap-2 text-tertiary">
           <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>star</span> Ulas
          </button>
         )}
         {['PAID', 'BORROWED', 'RETURNED', 'COMPLETED'].includes(tx.status) && (
          <button onClick={() => handleExportInvoicePDF(tx)} className="px-4 py-2 bg-surface hover:bg-surface-variant border border-outline-variant/30 rounded-lg transition-colors font-label-md text-label-md flex items-center justify-center gap-2 text-on-surface">
           <span className="material-symbols-outlined text-[18px]">download</span> Invoice
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
  <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col relative overflow-x-hidden dot-pattern">
   <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-gutter py-stack-lg flex flex-col md:flex-row gap-gutter">
    
    {/* SideNavBar Component (Hidden on Mobile) */}
    <aside className="hidden md:flex flex-col gap-stack-sm p-stack-md w-64 glass-panel premium-shadow rounded-xl h-fit sticky top-24 shrink-0 bg-surface-container-low/80">
     <div className="flex items-center gap-3 mb-4 pb-4 border-b border-outline-variant/20">
      <div className="w-12 h-12 rounded-full bg-surface-variant overflow-hidden shrink-0 border-2 border-primary-container">
       {user?.fotoProfil ? (
          <img alt="User Profile Picture" className="w-full h-full object-cover" src={`${UPLOADS_URL}${user.fotoProfil}`} />
       ) : (
          <div className="w-full h-full flex items-center justify-center text-primary font-bold bg-primary/20">{user?.nama?.charAt(0)?.toUpperCase()}</div>
       )}
      </div>
      <div>
       <h2 className="font-title-md text-[16px] text-primary line-clamp-1">Akun Saya</h2>
       {user?.isVerified && (
          <p className="font-label-sm text-[11px] text-on-surface-variant flex items-center gap-1">
           <span className="material-symbols-outlined text-[14px] text-secondary" data-icon="verified">verified</span>
           Terverifikasi
          </p>
       )}
      </div>
     </div>
     <nav className="flex flex-col gap-2">
      <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform font-label-md text-label-md" to="/profile">
       <span className="material-symbols-outlined">person</span>
       <span>Profil Saya</span>
      </Link>
      <Link className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container font-semibold rounded-lg scale-98 duration-150 font-label-md text-label-md shadow-md" to="/transactions">
       <span className="material-symbols-outlined">history</span>
       <span>Transaksi</span>
      </Link>
      <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform font-label-md text-label-md" to="/chat">
       <span className="material-symbols-outlined">chat</span>
       <span>Pesan</span>
      </Link>
      <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform font-label-md text-label-md" to="/wallet">
       <span className="material-symbols-outlined">account_balance_wallet</span>
       <span>Dompet</span>
      </Link>
     </nav>
    </aside>

    {/* Content Area */}
    <section className="flex-1 flex flex-col gap-stack-lg min-w-0">
     {/* Header & Controls */}
     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-md">
      <div>
       <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold">Transaksi</h1>
       <p className="font-body-md text-body-md text-on-surface-variant mt-1">Pantau status peminjaman dan permintaan Anda.</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-stack-md w-full md:w-auto">
       <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/30 hover:bg-surface-container-highest transition-colors font-label-md text-label-md bg-surface">
        <span className="material-symbols-outlined text-sm">download</span>
        Export Excel
       </button>
      </div>
     </div>

     {/* Transaction Summary Widget */}
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="glass-panel p-4 rounded-xl premium-shadow flex flex-col gap-2 hover:-translate-y-1 transition-transform border-t-4 border-t-primary-container">
       <div className="flex justify-between items-center">
        <span className="font-label-sm text-label-sm text-on-surface-variant">Peminjaman Aktif</span>
        <span className="material-symbols-outlined text-primary-container text-sm">swap_horiz</span>
       </div>
       <span className="font-display-lg text-3xl font-extrabold text-on-surface">{activeBorrowings}</span>
      </div>
      <div className="glass-panel p-4 rounded-xl premium-shadow flex flex-col gap-2 hover:-translate-y-1 transition-transform border-t-4 border-t-tertiary-fixed-dim">
       <div className="flex justify-between items-center">
        <span className="font-label-sm text-label-sm text-on-surface-variant">Menunggu Persetujuan</span>
        <span className="material-symbols-outlined text-tertiary text-sm">pending_actions</span>
       </div>
       <span className="font-display-lg text-3xl font-extrabold text-tertiary">{pendingRequests}</span>
      </div>
      <div className="glass-panel p-4 rounded-xl premium-shadow flex flex-col gap-2 hover:-translate-y-1 transition-transform border-t-4 border-t-secondary-container">
       <div className="flex justify-between items-center">
        <span className="font-label-sm text-label-sm text-on-surface-variant">Selesai (Bulan Ini)</span>
        <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
       </div>
       <span className="font-display-lg text-3xl font-extrabold text-secondary">{completedThisMonth}</span>
      </div>
      <div className="glass-panel p-4 rounded-xl premium-shadow flex flex-col gap-2 hover:-translate-y-1 transition-transform border-t-4 border-t-error">
       <div className="flex justify-between items-center">
        <span className="font-label-sm text-label-sm text-on-surface-variant">Perlu Tindakan</span>
        <span className="material-symbols-outlined text-error text-sm">error</span>
       </div>
       <span className="font-display-lg text-3xl font-extrabold text-error">{needsAction}</span>
      </div>
     </div>

     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      {/* Tab Switcher */}
      <div className="flex bg-surface-container-high p-1 rounded-xl w-full max-w-md mx-auto md:mx-0 shrink-0">
       <button 
         onClick={() => setActiveTab('borrowings')}
         className={`flex-1 px-4 py-2 font-label-md text-label-md transition-colors rounded-lg ${activeTab === 'borrowings' ? 'font-bold bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
       >
         Peminjaman Saya
       </button>
       <button 
         onClick={() => setActiveTab('requests')}
         className={`flex-1 px-4 py-2 font-label-md text-label-md transition-colors rounded-lg ${activeTab === 'requests' ? 'font-bold bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
       >
         Permintaan Masuk
       </button>
      </div>

      {/* Filter Tanggal */}
      <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end md:justify-start">
        <span className="material-symbols-outlined text-on-surface-variant">filter_alt</span>
        <input 
          type="month" 
          value={filterMonth} 
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-2 bg-surface border border-outline-variant/30 rounded-lg text-label-md text-on-surface focus:outline-none focus:border-primary flex-1 md:flex-none"
        />
        {filterMonth && (
          <button onClick={() => setFilterMonth('')} className="text-error text-[12px] hover:underline shrink-0">Reset</button>
        )}
      </div>
     </div>

     <div className="flex flex-col lg:flex-row gap-gutter">
      {/* Transaction List */}
      <div className="flex-1 flex flex-col gap-stack-md">
       {isLoading ? (
        <div className="flex justify-center py-20">
         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
       ) : filteredData.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
         <span className="material-symbols-outlined text-[48px] block mb-2 opacity-50">inbox</span>
         Belum ada transaksi ditemukan.
        </div>
       ) : (
        <>
         {displayedData.map(tx => renderTransactionCard(tx, activeTab === 'requests'))}
         
         {visibleCount < filteredData.length && (
          <div className="flex justify-center mt-4 mb-8">
           <button 
            onClick={() => setVisibleCount(prev => prev + 5)}
            className="px-6 py-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/20 text-on-surface rounded-full font-label-md transition-colors shadow-sm flex items-center gap-2"
           >
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
            Muat Lebih Banyak
           </button>
          </div>
         )}
        </>
       )}
      </div>

      {/* Right Sidebar Widgets */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
       {/* Tips & Safety Sidebar */}
       <div className="glass-panel p-stack-md rounded-xl premium-shadow flex flex-col gap-3 bg-secondary/5 border-secondary/20">
        <h3 className="font-title-md text-[16px] text-on-surface font-semibold flex items-center gap-2">
         <span className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
         Tips & Keamanan
        </h3>
        <ul className="flex flex-col gap-3 mt-2">
         <li className="flex gap-2 items-start">
          <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
          <p className="font-body-md text-[13px] text-on-surface-variant leading-relaxed">Selalu komunikasikan detail peminjaman melalui fitur Chat kami.</p>
         </li>
         <li className="flex gap-2 items-start">
          <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
          <p className="font-body-md text-[13px] text-on-surface-variant leading-relaxed">Cek kondisi barang bersama pemilik saat serah terima.</p>
         </li>
         <li className="flex gap-2 items-start">
          <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
          <p className="font-body-md text-[13px] text-on-surface-variant leading-relaxed">Gunakan metode pembayaran resmi platform untuk keamanan transaksi.</p>
         </li>
        </ul>
       </div>
      </div>
     </div>
    </section>
   </main>

   {/* Review Modal */}
   {reviewModal.isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
     <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setReviewModal({ isOpen: false, txId: null, rating: 5, comment: '' })}></div>
     <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl border border-outline-variant/20 p-stack-lg flex flex-col gap-stack-md transform transition-all animate-in zoom-in-95 relative z-10">
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
       <h2 className="font-title-md text-title-md font-bold text-on-surface">Beri Ulasan</h2>
       <button className="text-outline hover:text-error transition-colors" onClick={() => setReviewModal({ isOpen: false, txId: null, rating: 5, comment: '' })}>
        <span className="material-symbols-outlined">close</span>
       </button>
      </div>
      <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
       <div>
        <label className="font-label-md text-label-md font-semibold text-on-surface mb-2 block">Rating</label>
        <div className="flex gap-2 justify-center py-2">
         {[1, 2, 3, 4, 5].map((star) => (
          <button
           key={star}
           type="button"
           onClick={() => setReviewModal({ ...reviewModal, rating: star })}
           className={`p-2 rounded-full transition-all ${reviewModal.rating >= star ? 'text-tertiary bg-tertiary-container/10' : 'text-outline hover:bg-surface-variant'}`}
          >
           <span className="material-symbols-outlined text-[32px]" style={{fontVariationSettings: reviewModal.rating >= star ?"'FILL' 1" :"'FILL' 0"}}>star</span>
          </button>
         ))}
        </div>
       </div>
       <div>
        <label className="font-label-md text-label-md font-semibold text-on-surface mb-2 block">Komentar (Opsional)</label>
        <textarea
         className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
         rows="3"
         placeholder="Bagaimana pengalaman Anda?"
         value={reviewModal.comment}
         onChange={(e) => setReviewModal({ ...reviewModal, comment: e.target.value })}
        ></textarea>
       </div>
       <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
        <button type="button" onClick={() => setReviewModal({ isOpen: false, txId: null, rating: 5, comment: '' })} className="px-4 py-2 border border-outline-variant/30 rounded-lg font-label-md text-label-md hover:bg-surface-container-lowest transition-colors text-on-surface">
         Batal
        </button>
        <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md shadow-md hover:shadow-lg transition-all">
         Kirim Ulasan
        </button>
       </div>
      </form>
     </div>
    </div>
   )}

   {/* Payment Modal */}
   {paymentModal.isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
     <div className="absolute inset-0" onClick={() => setPaymentModal({ isOpen: false, txId: null, file: null, amount: 0 })}></div>
     <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant/20 flex flex-col gap-stack-md transform transition-all overflow-hidden z-10 animate-in zoom-in-95">
      <div className="flex justify-between items-center border-b border-outline-variant/20 p-6 bg-surface-container-low ">
       <h2 className="font-title-md text-title-md font-bold text-on-surface ">Pembayaran</h2>
       <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-variant transition-colors" onClick={() => setPaymentModal({ isOpen: false, txId: null, file: null, amount: 0 })}>
        <span className="material-symbols-outlined">close</span>
       </button>
      </div>
      
      <form onSubmit={handlePaymentSubmit}>
       <div className="flex flex-col gap-5 p-6 pt-2">
        <div className="flex items-center justify-between bg-primary/10 p-4 rounded-xl border border-primary/20">
         <span className="font-label-md text-label-md text-on-surface font-medium">Total Tagihan</span>
         <span className="font-title-md text-[18px] text-primary font-bold">Rp {paymentModal.amount.toLocaleString('id-ID')}</span>
        </div>
        
        <div>
         <p className="font-body-md text-[14px] text-on-surface-variant mb-3">Silakan transfer sesuai nominal ke rekening berikut:</p>
         <div className="bg-surface rounded-lg p-4 border border-outline-variant/30 flex justify-between items-center shadow-sm">
          <div>
           <p className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wide">Bank BCA</p>
           <p className="font-title-md text-[18px] text-on-surface font-bold font-mono tracking-wider mt-1">6005 0504 50</p>
           <p className="font-label-sm text-[12px] text-on-surface-variant mt-1">a.n. Admin CampusRent</p>
          </div>
         </div>
        </div>
        
        <div className="border-t border-outline-variant/20 pt-4">
         <label className="font-label-md text-label-md font-semibold text-on-surface mb-2 block">Upload Bukti Transfer</label>
         <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-primary/10 transition-colors cursor-pointer group"
         >
          {paymentModal.file ? (
           <>
            <span className="material-symbols-outlined text-3xl text-secondary mb-2 group-hover:scale-110 transition-transform">check_circle</span>
            <span className="font-label-sm text-[13px] text-on-surface truncate max-w-[200px]">{paymentModal.file.name}</span>
           </>
          ) : (
           <>
            <span className="material-symbols-outlined text-3xl text-primary mb-2 group-hover:scale-110 transition-transform">cloud_upload</span>
            <span className="font-label-sm text-[13px] text-on-surface-variant font-medium">Klik atau drag file ke sini</span>
            <span className="text-[11px] text-outline mt-1">(Max 2MB, JPG/PNG)</span>
           </>
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
       </div>
       
       <div className="p-6 border-t border-outline-variant/20 bg-surface flex justify-end gap-3">
        <button type="button" onClick={() => setPaymentModal({ isOpen: false, txId: null, file: null, amount: 0 })} className="px-5 py-2.5 rounded-lg border border-outline-variant font-label-md text-label-md font-semibold text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
         Batal
        </button>
        <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold shadow-md transition-all hover:-translate-y-0.5">
         Konfirmasi Bayar
        </button>
       </div>
      </form>
     </div>
    </div>
   )}

   {/* Extend Modal */}
   {extendModal.isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
     <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setExtendModal({ isOpen: false, txId: null, days: 1, reason: '' })}></div>
     <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl border border-outline-variant/20 p-stack-lg flex flex-col gap-stack-md transform transition-all animate-in zoom-in-95 relative z-10">
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
       <h2 className="font-title-md text-title-md font-bold text-on-surface">Ajukan Perpanjangan</h2>
       <button className="text-outline hover:text-error transition-colors" onClick={() => setExtendModal({ isOpen: false, txId: null, days: 1, reason: '' })}>
        <span className="material-symbols-outlined">close</span>
       </button>
      </div>
      <form onSubmit={handleRequestExtension} className="flex flex-col gap-4">
       <div>
        <label className="font-label-md text-label-md font-semibold text-on-surface mb-2 block">Tambah Durasi (Hari)</label>
        <input
         type="number"
         min="1"
         className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
         value={extendModal.days}
         onChange={(e) => setExtendModal({ ...extendModal, days: e.target.value })}
         required
        />
       </div>
       <div>
        <label className="font-label-md text-label-md font-semibold text-on-surface mb-2 block">Alasan (Opsional)</label>
        <textarea
         className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
         rows="3"
         placeholder="Kenapa Anda butuh perpanjangan waktu?"
         value={extendModal.reason}
         onChange={(e) => setExtendModal({ ...extendModal, reason: e.target.value })}
        ></textarea>
       </div>
       <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
        <button type="button" onClick={() => setExtendModal({ isOpen: false, txId: null, days: 1, reason: '' })} className="px-4 py-2 border border-outline-variant/30 rounded-lg font-label-md text-label-md hover:bg-surface-container-lowest transition-colors text-on-surface">
         Batal
        </button>
        <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md shadow-md hover:shadow-lg transition-all">
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
