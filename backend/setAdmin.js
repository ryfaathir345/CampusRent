const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if(users.length > 0) {
    await prisma.user.update({
      where: { id: users[0].id },
      data: { role: 'ADMIN' }
    });
    console.log('Updated user ' + users[0].email + ' to ADMIN');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
