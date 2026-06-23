const cron = require('node-cron');
const prisma = require('../config/database');

// Berjalan setiap hari jam 00:01 malam
cron.schedule('1 0 * * *', async () => {
  console.log('[CRON] Menjalankan pengecekan keterlambatan pengembalian barang...');

  try {
    const today = new Date();
    // Reset time to 00:00:00 for accurate day comparison
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const activeBorrowings = await prisma.transaction.findMany({
      where: {
        status: 'BORROWED',
        endDate: {
          lt: currentDate
        }
      },
      include: {
        item: true,
        borrower: true
      }
    });

    for (const tx of activeBorrowings) {
      const endDate = new Date(tx.endDate.getFullYear(), tx.endDate.getMonth(), tx.endDate.getDate());
      const diffTime = Math.abs(currentDate - endDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Jika telat lebih dari 3 hari, otomatis suspend user
      if (diffDays > 3 && !tx.borrower.isSuspended) {
        await prisma.user.update({
          where: { id: tx.borrowerId },
          data: { isSuspended: true }
        });

        await prisma.notification.create({
          data: {
            userId: tx.borrowerId,
            title: 'Akun Diblokir Sementara',
            message: `Akun Anda telah ditangguhkan secara otomatis karena keterlambatan pengembalian barang ${tx.item.namaBarang} lebih dari 3 hari. Segera kembalikan barang dan lunasi denda.`
          }
        });
        console.log(`[CRON] User ${tx.borrowerId} disuspend karena telat ${diffDays} hari.`);
      } else {
        // Jika masih telat biasa, kirim notifikasi harian
        const currentLateFee = diffDays * tx.item.hargaSewa;
        await prisma.notification.create({
          data: {
            userId: tx.borrowerId,
            title: 'Peringatan Keterlambatan!',
            message: `Anda terlambat mengembalikan barang ${tx.item.namaBarang} selama ${diffDays} hari. Estimasi denda saat ini adalah Rp${currentLateFee}. Mohon segera kembalikan.`
          }
        });
      }
    }
    
    console.log(`[CRON] Pengecekan selesai. Ditemukan ${activeBorrowings.length} transaksi terlambat.`);
  } catch (error) {
    console.error('[CRON] Error saat mengecek keterlambatan:', error);
  }
});
