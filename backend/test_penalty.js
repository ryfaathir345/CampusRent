const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- Starting Verification ---');

    // 1. Get a user and an item
    let borrower = await prisma.user.findFirst({ where: { role: 'MAHASISWA' } });
    if (!borrower) {
      borrower = await prisma.user.create({ data: { nama: 'Borrower', email: 'borrower@test.com', password: '123', isVerified: true } });
    }
    let owner = await prisma.user.findFirst({ where: { id: { not: borrower.id } } });
    if (!owner) {
      owner = await prisma.user.create({ data: { nama: 'Owner', email: 'owner@test.com', password: '123', isVerified: true } });
    }
    let item = await prisma.item.findFirst({ where: { ownerId: owner.id } });
    if (!item) {
      item = await prisma.item.create({ data: { namaBarang: 'Test Item', kategori: 'Electronics', deskripsi: 'Test', kondisiBarang: 'GOOD', lokasiPengambilan: 'Campus', maksimalHariPinjam: 7, hargaSewa: 10000, ownerId: owner.id } });
    }

    console.log(`Borrower: ${borrower.nama} (Saldo: ${borrower.saldo})`);
    console.log(`Owner: ${owner.nama} (Saldo: ${owner.saldo})`);
    console.log(`Item: ${item.namaBarang} (Harga Sewa: ${item.hargaSewa})`);

    // 2. Create a transaction that is late (endDate 5 days ago)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 10);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 5);

    const transaction = await prisma.transaction.create({
      data: {
        itemId: item.id,
        borrowerId: borrower.id,
        startDate: startDate,
        endDate: endDate,
        totalPrice: item.hargaSewa * 5,
        status: 'BORROWED'
      }
    });

    console.log(`Transaction created: ${transaction.id} with status BORROWED and endDate ${endDate.toISOString()}`);

    // 3. Simulate updating borrow status to RETURNED
    console.log('Simulating updateBorrowStatus to RETURNED...');
    
    // Logic from transaction.controller.js
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const txEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    let lateFee = 0;
    let finalStatus = 'RETURNED';

    if (today > txEndDate) {
      const diffTime = Math.abs(today - txEndDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      lateFee = diffDays * item.hargaSewa;
      finalStatus = 'WAITING_PENALTY_PAYMENT';
    }

    const updatedTx1 = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: finalStatus,
        lateFee: lateFee
      }
    });

    console.log(`Updated Transaction Status: ${updatedTx1.status}, Late Fee: ${updatedTx1.lateFee}`);

    if (updatedTx1.status === 'WAITING_PENALTY_PAYMENT') {
      console.log('Status is successfully set to WAITING_PENALTY_PAYMENT. Proceeding to payPenalty...');
      
      // Top up borrower saldo if needed
      if (borrower.saldo < updatedTx1.lateFee) {
        console.log(`Topping up borrower saldo by ${updatedTx1.lateFee}`);
        await prisma.user.update({
          where: { id: borrower.id },
          data: { saldo: { increment: updatedTx1.lateFee } }
        });
      }

      const borrowerBeforePay = await prisma.user.findUnique({ where: { id: borrower.id } });
      const ownerBeforePay = await prisma.user.findUnique({ where: { id: owner.id } });

      // Logic from payPenalty
      const ownerShare = Math.floor(updatedTx1.lateFee * 0.9);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: borrower.id },
          data: { saldo: { decrement: updatedTx1.lateFee } }
        }),
        prisma.user.update({
          where: { id: owner.id },
          data: { saldo: { increment: ownerShare } }
        }),
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'RETURNED',
            isLateFeePaid: true
          }
        })
      ]);

      const borrowerAfterPay = await prisma.user.findUnique({ where: { id: borrower.id } });
      const ownerAfterPay = await prisma.user.findUnique({ where: { id: owner.id } });
      const finalTx = await prisma.transaction.findUnique({ where: { id: transaction.id } });

      console.log(`Borrower Saldo: ${borrowerBeforePay.saldo} -> ${borrowerAfterPay.saldo} (Deducted ${updatedTx1.lateFee})`);
      console.log(`Owner Saldo: ${ownerBeforePay.saldo} -> ${ownerAfterPay.saldo} (Added ${ownerShare})`);
      console.log(`Final Transaction Status: ${finalTx.status}, isLateFeePaid: ${finalTx.isLateFeePaid}`);
    } else {
      console.log('Failed to set status to WAITING_PENALTY_PAYMENT.');
    }

    console.log('--- Verification Complete ---');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
