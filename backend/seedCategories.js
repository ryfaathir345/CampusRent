const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'ELEKTRONIK', icon: 'devices' },
  { name: 'BUKU', icon: 'menu_book' },
  { name: 'ALAT_PRAKTIKUM', icon: 'science' },
  { name: 'FASHION', icon: 'checkroom' },
  { name: 'OLAHRAGA', icon: 'sports_soccer' },
  { name: 'LAINNYA', icon: 'category' }
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('Categories seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
