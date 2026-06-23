const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('--- Memulai Reset Database ---');

  try {
    // Delete all dependent records
    console.log('Menghapus data terkait (Transactions, Items, dll)...');
    
    // Harus memperhatikan relasi (onDelete: Cascade di prisma schema sangat membantu, 
    // tapi lebih aman kita delete satu per satu dari child ke parent)
    
    await prisma.review.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.withdrawal.deleteMany({});
    await prisma.extensionRequest.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.wishlist.deleteMany({});
    await prisma.activityLog.deleteMany({});
    await prisma.notification.deleteMany({});
    
    // Delete transactions & items
    await prisma.transaction.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.category.deleteMany({});

    // Reset saldo pengguna menjadi 0
    console.log('Mereset saldo semua akun menjadi Rp0...');
    await prisma.user.updateMany({
      data: { saldo: 0 }
    });

    const userCount = await prisma.user.count();
    console.log(`Database berhasil dibersihkan! Tersisa ${userCount} akun User.`);

    // Clear uploads folder
    console.log('Membersihkan folder foto / uploads...');
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let deletedFilesCount = 0;
      
      for (const file of files) {
        // Jangan hapus file .gitkeep atau folder jika ada
        if (file !== '.gitkeep') {
          fs.unlinkSync(path.join(uploadsDir, file));
          deletedFilesCount++;
        }
      }
      console.log(`Berhasil menghapus ${deletedFilesCount} file foto.`);
    } else {
      console.log('Folder uploads tidak ditemukan, mengabaikan.');
    }

    console.log('--- Reset Selesai ---');
  } catch (error) {
    console.error('Error saat mereset database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
