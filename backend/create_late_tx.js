const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- Membuat Transaksi Terlambat untuk Test Denda ---');

    // Ambil borrower (biasanya user utama / login saat ini)
    let borrower = await prisma.user.findFirst({ where: { role: 'MAHASISWA' } });
    if (!borrower) {
      console.log('User borrower tidak ditemukan.');
      return;
    }

    // Ambil/Buat owner
    let owner = await prisma.user.findFirst({ where: { id: { not: borrower.id } } });
    if (!owner) {
      owner = await prisma.user.create({ 
        data: { nama: 'Owner Dummy', email: 'ownerdummy@test.com', password: '123', isVerified: true, role: 'MAHASISWA' } 
      });
    }

    // Ambil/Buat Item
    let item = await prisma.item.findFirst({ where: { ownerId: owner.id } });
    if (!item) {
      item = await prisma.item.create({ 
        data: { 
          namaBarang: 'Kamera DSLR Test Denda', 
          kategori: 'Elektronik', 
          deskripsi: 'Barang untuk test denda', 
          kondisiBarang: 'Bagus', 
          lokasiPengambilan: 'Kampus', 
          maksimalHariPinjam: 3, 
          hargaSewa: 50000, 
          ownerId: owner.id 
        } 
      });
    }

    // Tanggal sekarang
    const now = new Date();
    // startDate 10 hari yang lalu
    const startDate = new Date();
    startDate.setDate(now.getDate() - 10);
    // endDate 5 hari yang lalu (Artinya TELAT 5 HARI)
    const endDate = new Date();
    endDate.setDate(now.getDate() - 5);

    // Buat transaksi dengan status BORROWED tapi sudah melewati endDate
    const transaction = await prisma.transaction.create({
      data: {
        itemId: item.id,
        borrowerId: borrower.id,
        startDate: startDate,
        endDate: endDate,
        totalPrice: item.hargaSewa * 5,
        status: 'BORROWED' // Peminjam belum klik kembalikan
      }
    });

    // Top up saldo peminjam agar bisa bayar denda (denda = 5 hari * 50.000 = 250.000)
    await prisma.user.update({
      where: { id: borrower.id },
      data: { saldo: { increment: 300000 } }
    });

    console.log(`Transaksi berhasil dibuat!`);
    console.log(`Transaction ID : ${transaction.id}`);
    console.log(`Peminjam       : ${borrower.nama}`);
    console.log(`Pemilik Barang : ${owner.nama}`);
    console.log(`Barang         : ${item.namaBarang}`);
    console.log(`Status         : ${transaction.status}`);
    console.log(`Jatuh Tempo    : ${endDate.toLocaleDateString('id-ID')}`);
    console.log('\n--- CARA TEST ---');
    console.log('1. Buka halaman Peminjaman Saya.');
    console.log('2. Klik tombol "Kembalikan Barang".');
    console.log('3. Sistem akan otomatis mendeteksi bahwa ini terlambat, dan status akan berubah menjadi "Bayar Denda" (WAITING_PENALTY_PAYMENT).');
    console.log('4. Tombol "Bayar Denda" berwarna merah akan muncul beserta nominal denda.');
    console.log('5. Klik "Bayar Denda" tersebut (saldo kamu sudah ditambahkan Rp300.000 agar cukup).');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
