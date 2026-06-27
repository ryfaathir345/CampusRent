const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.item.updateMany({
    where: { hargaSewa: 99998 },
    data: { hargaSewa: 100000 }
  });
  console.log("Updated prices back to 100000");
}

main().catch(console.error).finally(() => prisma.$disconnect());
