const prisma = require('./config/prisma');

async function main() {
  try {
    await prisma.$connect();
    console.log('CONNECTED TO POSTGRESQL SUCCESSFULLY!');
  } catch (err) {
    console.error('CONNECTION ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
