const { PrismaClient } = require('@prisma/client');

const passwords = ['postgres', 'root', 'admin', 'password', '123456', 'harsh', '1234', 'Postgres', 'Admin@123', 'system', '12345', 'sql', '12345678', 'postgres123', 'admin123'];

async function testPasswords() {
  for (const pwd of passwords) {
    const url = `postgresql://postgres:${encodeURIComponent(pwd)}@localhost:5432/postgres?schema=public`;
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      await prisma.$connect();
      console.log(`\n🎉 FOUND VALID PASSWORD: "${pwd}"`);
      await prisma.$disconnect();
      return pwd;
    } catch (err) {
      if (err.message.includes('Authentication failed')) {
        console.log(`[FAILED] Password: "${pwd}" - Invalid credentials`);
      } else {
        console.log(`[CONNECTED/DB MISSING] Password: "${pwd}" - ${err.message.slice(0, 100)}`);
        await prisma.$disconnect();
        return pwd;
      }
      await prisma.$disconnect();
    }
  }
  console.log('\nNone of the common passwords matched.');
}

testPasswords();
