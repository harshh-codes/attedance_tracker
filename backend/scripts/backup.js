const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');

async function createBackup() {
  console.log('Starting automated database backup snapshot...');

  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup_${timestamp}.json`);

  try {
    const [users, attendances, officeLocations, companySettings, auditLogs, userSessions, loginHistory] = await Promise.all([
      prisma.user.findMany(),
      prisma.attendance.findMany(),
      prisma.officeLocation.findMany(),
      prisma.companySettings.findMany(),
      prisma.auditLog.findMany(),
      prisma.userSession.findMany(),
      prisma.loginHistory.findMany()
    ]);

    const backupData = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      counts: {
        users: users.length,
        attendances: attendances.length,
        officeLocations: officeLocations.length,
        companySettings: companySettings.length,
        auditLogs: auditLogs.length,
        userSessions: userSessions.length,
        loginHistory: loginHistory.length
      },
      data: {
        users,
        attendances,
        officeLocations,
        companySettings,
        auditLogs,
        userSessions,
        loginHistory
      }
    };

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup successfully saved to: ${backupFile}`);
  } catch (err) {
    console.error('❌ Backup failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createBackup();
