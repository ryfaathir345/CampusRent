// src/controllers/transaction.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// POST /api/transactions
// Ajukan pinjaman
const createRequest = asyncHandler(async (req, res) => {
  const { itemId, startDate, endDate } = req.body;
  const borrowerId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: borrowerId } });
  if (!user.isVerified) {
    return errorResponse(res, 403, 'Anda harus melakukan verifikasi KTM terlebih dahulu sebelum meminjam barang');
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return errorResponse(res, 404, 'Barang tidak ditemukan');

  if (item.ownerId === borrowerId) {
    return errorResponse(res, 400, 'Anda tidak bisa meminjam barang milik sendiri');
  }

  if (item.statusBarang !== 'TERSEDIA') {
    return errorResponse(res, 400, 'Barang sedang tidak tersedia');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate total days
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // minimum 1 day

  if (diffDays > item.maksimalHariPinjam) {
    return errorResponse(res, 400, `Maksimal peminjaman adalah ${item.maksimalHariPinjam} hari`);
  }

  const basePrice = diffDays * item.hargaSewa;
  const adminFee = 5000;
  let discountAmount = 0;
  let promoId = null;

  // Process Promo
  const { promoCode } = req.body;
  if (promoCode) {
    const promo = await prisma.promo.findUnique({ where: { code: promoCode } });
    
    if (promo && promo.isActive && new Date() >= promo.startDate && new Date() <= promo.endDate) {
      // Check if user already used this promo (ignore REJECTED)
      const existingTransaction = await prisma.transaction.findFirst({
        where: { borrowerId, promoId: promo.id, status: { not: 'REJECTED' } }
      });
      
      if (!existingTransaction) {
        promoId = promo.id;
        let calculatedDiscount = Math.floor(basePrice * (promo.discountPercent / 100));
        
        if (promo.maxDiscount && calculatedDiscount > promo.maxDiscount) {
          calculatedDiscount = promo.maxDiscount;
        }
        
        // Ensure discount doesn't exceed basePrice
        if (calculatedDiscount > basePrice) {
          calculatedDiscount = basePrice;
        }
        
        discountAmount = calculatedDiscount;
      }
    }
  }

  const totalPrice = (basePrice - discountAmount) + adminFee;

  // Cek apakah sebelumnya ada INQUIRY untuk item ini
  const existingInquiry = await prisma.transaction.findFirst({
    where: { itemId, borrowerId, status: 'INQUIRY' }
  });

  let transaction;
  if (existingInquiry) {
    // Upgrade INQUIRY menjadi PENDING
    transaction = await prisma.transaction.update({
      where: { id: existingInquiry.id },
      data: {
        startDate: start,
        endDate: end,
        totalPrice,
        promoId,
        discountAmount,
        status: 'PENDING'
      }
    });
  } else {
    // Buat baru jika belum ada
    transaction = await prisma.transaction.create({
      data: {
        itemId,
        borrowerId,
        startDate: start,
        endDate: end,
        totalPrice,
        promoId,
        discountAmount,
        status: 'PENDING'
      }
    });
  }

  // Notifikasi ke owner
  await prisma.notification.create({
    data: {
      userId: item.ownerId,
      title: 'Permintaan Peminjaman Baru',
      message: `${req.user.nama} mengajukan pinjaman untuk barang ${item.namaBarang}`
    }
  });

  return successResponse(res, 201, 'Pengajuan pinjaman berhasil dibuat', transaction);
});

// POST /api/transactions/inquiry
// Membuat atau mendapatkan chat tanya-tanya sebelum meminjam
const createInquiry = asyncHandler(async (req, res) => {
  const { itemId } = req.body;
  const borrowerId = req.user.id;

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return errorResponse(res, 404, 'Barang tidak ditemukan');

  if (item.ownerId === borrowerId) {
    return errorResponse(res, 400, 'Anda tidak bisa membuat inquiry pada barang sendiri');
  }

  let transaction = await prisma.transaction.findFirst({
    where: { itemId, borrowerId, status: 'INQUIRY' }
  });

  if (!transaction) {
    // Buat dummy transaksi berstatus INQUIRY agar sistem chat bisa berjalan
    transaction = await prisma.transaction.create({
      data: {
        itemId,
        borrowerId,
        startDate: new Date(),
        endDate: new Date(),
        totalPrice: 0,
        status: 'INQUIRY'
      }
    });
  }

  return successResponse(res, 201, 'Inquiry chat siap', transaction);
});

// GET /api/transactions/borrowings
// Peminjaman saya (sebagai peminjam)
const getMyBorrowings = asyncHandler(async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { 
      borrowerId: req.user.id,
      status: { not: 'INQUIRY' }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      borrower: {
        select: { id: true, nama: true, email: true, nim: true, whatsapp: true }
      },
      item: {
        include: {
          owner: {
            select: { id: true, nama: true, email: true, whatsapp: true, fotoProfil: true }
          }
        }
      },
      extensions: true
    }
  });

  return successResponse(res, 200, 'Berhasil memuat daftar peminjaman', transactions);
});

// GET /api/transactions/requests
// Permintaan masuk (sebagai pemilik barang)
const getMyItemRequests = asyncHandler(async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      item: { ownerId: req.user.id },
      status: { not: 'INQUIRY' }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      item: true,
      borrower: {
        select: { id: true, nama: true, nim: true, jurusan: true, whatsapp: true, fotoProfil: true }
      },
      extensions: true
    }
  });

  return successResponse(res, 200, 'Berhasil memuat permintaan masuk', transactions);
});

// PATCH /api/transactions/:id/status
// Update status oleh Owner (APPROVE, REJECT, COMPLETED)
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // APPROVED, REJECTED, COMPLETED

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { item: true }
  });

  if (!transaction) return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  
  if (transaction.item.ownerId !== req.user.id) {
    return errorResponse(res, 403, 'Akses ditolak. Anda bukan pemilik barang ini.');
  }

  // Kalkulasi biaya jika COMPLETED
  let newTotalPrice = transaction.totalPrice;
  let newActualReturnDate = transaction.actualReturnDate;
  if (status === 'COMPLETED') {
    newActualReturnDate = transaction.actualReturnDate || new Date();
    
    // Biaya admin 5000 ditanggung peminjam di awal (sudah masuk di totalPrice).
    // Jadi pemilik barang mendapatkan utuh harga sewa (totalPrice - 5000).
    const labaPemilik = newTotalPrice > 5000 ? newTotalPrice - 5000 : 0;
    
    // Tambahkan saldo ke pemilik
    await prisma.user.update({
      where: { id: transaction.item.ownerId },
      data: { saldo: { increment: labaPemilik } }
    });
  }

  // Update status transaksi
  const updatedTransaction = await prisma.transaction.update({
    where: { id },
    data: { 
      status,
      ...(status === 'COMPLETED' && { actualReturnDate: newActualReturnDate })
    }
  });

  // Jika APPROVED, tidak kurangi stok, kurangi stok saat PAID saja atau BORROWED.
  // Tapi untuk amannya kita hold stok sejak APPROVED agar tidak double booking.
  if (status === 'APPROVED') {
    const updatedItem = await prisma.item.update({
      where: { id: transaction.itemId },
      data: { stok: { decrement: 1 } }
    });
    if (updatedItem.stok <= 0) {
      await prisma.item.update({
        where: { id: transaction.itemId },
        data: { statusBarang: 'DIPINJAM' }
      });
    }
  }

  // Jika REJECTED, kembalikan stok
  if (status === 'REJECTED') {
    await prisma.item.update({
      where: { id: transaction.itemId },
      data: { 
        stok: { increment: 1 },
        statusBarang: 'TERSEDIA' 
      }
    });
  }
  // Jika COMPLETED, kembalikan stok
  if (status === 'COMPLETED') {
    await prisma.item.update({
      where: { id: transaction.itemId },
      data: { 
        stok: { increment: 1 },
        statusBarang: 'TERSEDIA' 
      }
    });
  }

  // Notifikasi ke borrower
  let notifMessage = `Status peminjaman barang ${transaction.item.namaBarang} diperbarui menjadi ${status}`;
  if (status === 'APPROVED') notifMessage = `Peminjaman barang ${transaction.item.namaBarang} disetujui. Silakan unggah bukti pembayaran.`;
  if (status === 'REJECTED') notifMessage = `Maaf, peminjaman barang ${transaction.item.namaBarang} ditolak.`;
  if (status === 'COMPLETED') {
    notifMessage = `Peminjaman barang ${transaction.item.namaBarang} telah selesai. Terima kasih!`;
  }

  await prisma.notification.create({
    data: {
      userId: transaction.borrowerId,
      title: 'Update Status Peminjaman',
      message: notifMessage
    }
  });

  return successResponse(res, 200, `Status berhasil diubah menjadi ${status}`, updatedTransaction);
});

// PATCH /api/transactions/:id/borrow
// Update status oleh Peminjam (BORROWED, RETURNED)
const updateBorrowStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // BORROWED, RETURNED

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { item: true }
  });

  if (!transaction) return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  
  if (transaction.borrowerId !== req.user.id) {
    return errorResponse(res, 403, 'Akses ditolak. Anda bukan peminjam.');
  }

  // Cek validitas urutan status
  if (status === 'BORROWED' && transaction.status !== 'PAID') {
    return errorResponse(res, 400, 'Pembayaran belum diverifikasi. Barang belum bisa diambil.');
  }
  if (status === 'RETURNED' && transaction.status !== 'BORROWED') {
    return errorResponse(res, 400, 'Barang harus diambil (BORROWED) sebelum dikembalikan');
  }

  let finalStatus = status;
  let lateFee = 0;

  if (status === 'RETURNED') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(transaction.endDate.getFullYear(), transaction.endDate.getMonth(), transaction.endDate.getDate());
    
    if (today > endDate) {
      const diffTime = Math.abs(today - endDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      lateFee = diffDays * transaction.item.hargaSewa;
      finalStatus = 'WAITING_PENALTY_PAYMENT';
    }
  }

  const updatedTransaction = await prisma.transaction.update({
    where: { id },
    data: { 
      status: finalStatus,
      lateFee,
      ...(status === 'RETURNED' && { actualReturnDate: new Date() })
    }
  });

  // Notifikasi ke owner
  let notifMessage = `Peminjam memperbarui status barang ${transaction.item.namaBarang} menjadi ${finalStatus}`;
  if (finalStatus === 'BORROWED') notifMessage = `Peminjam telah mengambil barang ${transaction.item.namaBarang}.`;
  if (finalStatus === 'RETURNED') notifMessage = `Peminjam telah mengembalikan barang ${transaction.item.namaBarang}. Mohon verifikasi dan Selesaikan transaksi.`;
  if (finalStatus === 'WAITING_PENALTY_PAYMENT') notifMessage = `Peminjam mengembalikan barang ${transaction.item.namaBarang} terlambat dan sedang menunggu pembayaran denda.`;

  await prisma.notification.create({
    data: {
      userId: transaction.item.ownerId,
      title: 'Update Status Peminjaman',
      message: notifMessage
    }
  });

  let responseMessage = `Status berhasil diubah menjadi ${finalStatus}`;
  if (finalStatus === 'WAITING_PENALTY_PAYMENT') {
    responseMessage = `Anda terlambat mengembalikan barang. Silakan bayar denda sebesar Rp${lateFee}.`;
  }

  return successResponse(res, 200, responseMessage, updatedTransaction);
});

// POST /api/transactions/:id/extend
// Peminjam mengajukan perpanjangan
const requestExtension = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { days, reason } = req.body;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { item: true }
  });

  if (!transaction) return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  if (transaction.borrowerId !== req.user.id) {
    return errorResponse(res, 403, 'Akses ditolak. Anda bukan peminjam.');
  }

  // Hanya bisa diperpanjang jika sedang dipinjam
  if (transaction.status !== 'BORROWED') {
    return errorResponse(res, 400, 'Perpanjangan hanya bisa dilakukan saat barang sedang dipinjam');
  }

  // Cek apakah sudah ada request yang PENDING
  const existingPending = await prisma.extensionRequest.findFirst({
    where: { transactionId: id, status: 'PENDING' }
  });
  if (existingPending) {
    return errorResponse(res, 400, 'Anda masih memiliki pengajuan perpanjangan yang belum direspon');
  }

  // Cek apakah saldo cukup untuk membayar biaya perpanjangan
  const additionalPrice = parseInt(days) * transaction.item.hargaSewa;
  const borrower = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (borrower.saldo < additionalPrice) {
    return errorResponse(res, 400, `Saldo CampusRent Anda tidak cukup untuk perpanjangan ini (Butuh Rp${additionalPrice}). Silakan Top Up terlebih dahulu.`);
  }

  const extension = await prisma.extensionRequest.create({
    data: {
      transactionId: id,
      days: parseInt(days),
      reason
    }
  });

  // Notifikasi ke owner
  await prisma.notification.create({
    data: {
      userId: transaction.item.ownerId,
      title: 'Pengajuan Perpanjangan Waktu',
      message: `${req.user.nama} mengajukan perpanjangan waktu untuk barang ${transaction.item.namaBarang} selama ${days} hari.`
    }
  });

  return successResponse(res, 201, 'Pengajuan perpanjangan berhasil dikirim', extension);
});

// PATCH /api/transactions/:id/extend/:extendId
// Owner menyetujui atau menolak perpanjangan
const respondExtension = asyncHandler(async (req, res) => {
  const { id, extendId } = req.params;
  const { status } = req.body; // APPROVED or REJECTED

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { item: true, borrower: true }
  });

  if (!transaction) return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  if (transaction.item.ownerId !== req.user.id) {
    return errorResponse(res, 403, 'Akses ditolak. Anda bukan pemilik barang ini.');
  }

  const extension = await prisma.extensionRequest.findUnique({
    where: { id: extendId }
  });

  if (!extension || extension.transactionId !== id) {
    return errorResponse(res, 404, 'Pengajuan perpanjangan tidak ditemukan');
  }
  if (extension.status !== 'PENDING') {
    return errorResponse(res, 400, 'Pengajuan perpanjangan sudah direspon sebelumnya');
  }

  await prisma.extensionRequest.update({
    where: { id: extendId },
    data: { status }
  });

  let notifMessage = `Pengajuan perpanjangan waktu untuk barang ${transaction.item.namaBarang} telah DITOLAK.`;

  if (status === 'APPROVED') {
    // Tambah durasi endDate dan totalPrice di transaksi
    const currentEndDate = new Date(transaction.endDate);
    const newEndDate = new Date(currentEndDate.setDate(currentEndDate.getDate() + extension.days));
    
    const additionalPrice = extension.days * transaction.item.hargaSewa;
    
    // Pastikan saldo peminjam masih cukup (berjaga-jaga jika terpakai untuk hal lain)
    const borrower = await prisma.user.findUnique({ where: { id: transaction.borrowerId } });
    if (borrower.saldo < additionalPrice) {
      return errorResponse(res, 400, 'Gagal menyetujui: Saldo peminjam saat ini tidak mencukupi untuk membayar perpanjangan ini.');
    }

    const newTotalPrice = transaction.totalPrice + additionalPrice;

    // Lakukan secara atomik: potong saldo peminjam dan update transaksi
    await prisma.$transaction([
      prisma.user.update({
        where: { id: transaction.borrowerId },
        data: { saldo: { decrement: additionalPrice } }
      }),
      prisma.transaction.update({
        where: { id },
        data: {
          endDate: newEndDate,
          totalPrice: newTotalPrice
        }
      })
    ]);

    notifMessage = `Pengajuan perpanjangan waktu untuk barang ${transaction.item.namaBarang} telah DISETUJUI. Saldo Anda telah dipotong Rp${additionalPrice} dan tenggat waktu bertambah ${extension.days} hari.`;
  }

  // Notifikasi ke borrower
  await prisma.notification.create({
    data: {
      userId: transaction.borrowerId,
      title: 'Respon Perpanjangan Waktu',
      message: notifMessage
    }
  });

  return successResponse(res, 200, `Perpanjangan berhasil ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
});

// GET /api/transactions/stats
// Statistik untuk Dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Barang yang saya sewakan (milik saya)
  const myItemsCount = await prisma.item.count({
    where: { ownerId: userId }
  });

  // Barang saya yang sedang dipinjam orang
  const myItemsBorrowed = await prisma.item.count({
    where: { ownerId: userId, statusBarang: 'DIPINJAM' }
  });

  // Transaksi peminjaman yang sedang saya lakukan (aktif: APPROVED, BORROWED)
  const activeBorrowingsCount = await prisma.transaction.count({
    where: {
      borrowerId: userId,
      status: { in: ['APPROVED', 'BORROWED'] }
    }
  });

  // Transaksi yang perlu aksi:
  // - Sebagai owner: PENDING (butuh di-approve), RETURNED (butuh diselesaikan)
  const pendingRequestsAsOwner = await prisma.transaction.count({
    where: {
      item: { ownerId: userId },
      status: 'PENDING'
    }
  });

  const returnedToVerifyAsOwner = await prisma.transaction.count({
    where: {
      item: { ownerId: userId },
      status: 'RETURNED'
    }
  });

  // Reminder pengembalian (Barang yang saya pinjam dan mendekati end date, misal < 2 hari lagi)
  // Untuk kesederhanaan MVP, tampilkan semua BORROWED yang endDate-nya < now + 2 days
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

  const reminders = await prisma.transaction.findMany({
    where: {
      borrowerId: userId,
      status: 'BORROWED',
      endDate: { lte: twoDaysFromNow }
    },
    include: { item: true }
  });

  return successResponse(res, 200, 'Berhasil memuat statistik', {
    myItemsCount,
    myItemsBorrowed,
    activeBorrowingsCount,
    actionNeededCount: pendingRequestsAsOwner + returnedToVerifyAsOwner,
    reminders
  });
});

// POST /api/transactions/:id/pay-penalty
// Peminjam membayar denda keterlambatan menggunakan saldo
const payPenalty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { item: { include: { owner: true } } }
  });

  if (!transaction) return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  
  if (transaction.borrowerId !== req.user.id) {
    return errorResponse(res, 403, 'Akses ditolak. Anda bukan peminjam.');
  }

  if (transaction.status !== 'WAITING_PENALTY_PAYMENT' || transaction.lateFee <= 0) {
    return errorResponse(res, 400, 'Tidak ada denda yang harus dibayar pada transaksi ini.');
  }

  const borrower = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (borrower.saldo < transaction.lateFee) {
    return errorResponse(res, 400, 'Saldo CampusRent Anda tidak cukup untuk membayar denda. Silakan Top Up terlebih dahulu.');
  }

  // Calculate 90% for owner
  const ownerShare = Math.floor(transaction.lateFee * 0.9);

  // Perform a transaction to ensure atomic updates
  await prisma.$transaction([
    // Deduct from borrower
    prisma.user.update({
      where: { id: borrower.id },
      data: { saldo: { decrement: transaction.lateFee } }
    }),
    // Add to owner
    prisma.user.update({
      where: { id: transaction.item.ownerId },
      data: { saldo: { increment: ownerShare } }
    }),
    // Update transaction status
    prisma.transaction.update({
      where: { id },
      data: {
        status: 'RETURNED',
        isLateFeePaid: true
      }
    }),
    // Notify owner
    prisma.notification.create({
      data: {
        userId: transaction.item.ownerId,
        title: 'Denda Keterlambatan Dibayar',
        message: `Peminjam telah membayar denda untuk barang ${transaction.item.namaBarang}. Sebesar Rp${ownerShare} telah ditambahkan ke saldo Anda. Barang berstatus RETURNED.`
      }
    })
  ]);

  return successResponse(res, 200, `Berhasil membayar denda sebesar Rp${transaction.lateFee}. Status berubah menjadi RETURNED.`);
});

module.exports = {
  createRequest,
  createInquiry,
  getMyBorrowings,
  getMyItemRequests,
  updateRequestStatus,
  updateBorrowStatus,
  getDashboardStats,
  requestExtension,
  respondExtension,
  payPenalty
};
