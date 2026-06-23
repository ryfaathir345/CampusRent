const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE wishlists DROP FOREIGN KEY wishlists_item_id_fkey;`);
    console.log('FK dropped');
  } catch (err) {
    console.error('Error dropping FK:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
