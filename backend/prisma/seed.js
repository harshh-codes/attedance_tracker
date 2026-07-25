const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding for Landmark Developers...');

  // 1. Clear existing seed data (optional/idempotent safety)
  await prisma.auditLog.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.officeLocation.deleteMany();

  // 2. Hash default passwords
  const salt = await bcrypt.genSalt(10);
  const adminHashedPassword = await bcrypt.hash('Admin@123', salt);
  const employeeHashedPassword = await bcrypt.hash('Employee@123', salt);

  // 3. Seed System Admin
  const admin = await prisma.user.create({
    data: {
      employeeId: 'ADM-001',
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@landmarkdevelopers.com',
      password: adminHashedPassword,
      phone: '+91-9876543210',
      designation: 'System Administrator',
      department: 'IT & Infrastructure',
      role: 'ADMIN',
      accountStatus: 'APPROVED',
      isEmailVerified: true,
      isActive: true
    }
  });

  console.log(`✅ Admin Created: ${admin.email} (Role: ${admin.role})`);

  // 4. Seed 5 Employees
  const employeesData = [
    {
      employeeId: 'EMP-101',
      firstName: 'Rajesh',
      lastName: 'Sharma',
      email: 'rajesh.sharma@landmarkdevelopers.com',
      password: employeeHashedPassword,
      phone: '+91-9811122233',
      designation: 'Senior Civil Engineer',
      department: 'Engineering',
      role: 'EMPLOYEE',
      accountStatus: 'APPROVED',
      isEmailVerified: true,
      isActive: true
    },
    {
      employeeId: 'EMP-102',
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.patel@landmarkdevelopers.com',
      password: employeeHashedPassword,
      phone: '+91-9822233344',
      designation: 'Site Operations Manager',
      department: 'Operations',
      role: 'EMPLOYEE',
      accountStatus: 'APPROVED',
      isEmailVerified: true,
      isActive: true
    },
    {
      employeeId: 'EMP-103',
      firstName: 'Amit',
      lastName: 'Verma',
      email: 'amit.verma@landmarkdevelopers.com',
      password: employeeHashedPassword,
      phone: '+91-9833344455',
      designation: 'Project Manager',
      department: 'Construction',
      role: 'EMPLOYEE',
      accountStatus: 'APPROVED',
      isEmailVerified: true,
      isActive: true
    },
    {
      employeeId: 'EMP-104',
      firstName: 'Sneha',
      lastName: 'Reddy',
      email: 'sneha.reddy@landmarkdevelopers.com',
      password: employeeHashedPassword,
      phone: '+91-9844455566',
      designation: 'HR Specialist',
      department: 'Human Resources',
      role: 'EMPLOYEE',
      accountStatus: 'APPROVED',
      isEmailVerified: true,
      isActive: true
    },
    {
      employeeId: 'EMP-105',
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram.singh@landmarkdevelopers.com',
      password: employeeHashedPassword,
      phone: '+91-9855566677',
      designation: 'Finance Analyst',
      department: 'Finance',
      role: 'EMPLOYEE',
      accountStatus: 'APPROVED',
      isEmailVerified: true,
      isActive: true
    }
  ];

  for (const empData of employeesData) {
    const createdEmp = await prisma.user.create({ data: empData });
    console.log(`✅ Employee Created: ${createdEmp.employeeId} - ${createdEmp.firstName} ${createdEmp.lastName} (${createdEmp.department})`);
  }

  // 5. Seed Active Office Location (Landmark Developers HQ)
  const office = await prisma.officeLocation.create({
    data: {
      officeName: 'Landmark Developers HQ',
      latitude: 28.6139,
      longitude: 77.2090,
      allowedRadius: 200.0, // 200 meters allowed radius
      address: 'Landmark Towers, Barakhamba Road, Connaught Place, New Delhi, 110001',
      isActive: true
    }
  });

  console.log(`🏢 Active Office Location Created: ${office.officeName} (Radius: ${office.allowedRadius}m)`);

  // 6. Log Initial System Audit Record
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_INIT',
      description: 'Database initialized with system admin, sample employees, and active office location.',
      ipAddress: '127.0.0.1'
    }
  });

  console.log('🎉 Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
