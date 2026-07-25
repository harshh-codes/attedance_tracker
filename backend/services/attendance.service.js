const prisma = require('../config/prisma');
const { calculateHaversineDistance } = require('../utils/haversine');
const { logAudit } = require('../utils/auditLogger');

/**
 * Get start and end dates of today in local/UTC format
 */
const getTodayDateObj = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month, day, 23, 59, 59, 999);

  return { startOfDay, endOfDay, dateOnly: startOfDay };
};

/**
 * Check if employee has already punched in today
 */
const getTodayStatus = async (userId) => {
  const { startOfDay, endOfDay } = getTodayDateObj();

  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      userId,
      attendanceDate: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      user: {
        select: {
          employeeId: true,
          firstName: true,
          lastName: true,
          department: true,
          designation: true
        }
      }
    }
  });

  return {
    hasPunched: !!existingAttendance,
    attendance: existingAttendance || null
  };
};

/**
 * Execute GPS-based attendance punch-in
 */
const punchIn = async (userId, latitude, longitude, deviceInfo, ipAddress) => {
  // 1. Check duplicate punch-in for today
  const { hasPunched, attendance: existing } = await getTodayStatus(userId);
  if (hasPunched && existing) {
    const error = new Error('You have already marked attendance today.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Fetch Active Office Location
  const activeOffice = await prisma.officeLocation.findFirst({
    where: { isActive: true }
  });

  if (!activeOffice) {
    const error = new Error('No active office location configured for geofence verification. Please contact Administrator.');
    error.statusCode = 500;
    throw error;
  }

  // 3. Calculate Haversine Distance in meters
  const distanceMeters = calculateHaversineDistance(
    latitude,
    longitude,
    activeOffice.latitude,
    activeOffice.longitude
  );

  const roundedDistance = Math.round(distanceMeters * 100) / 100; // Round to 2 decimal places

  // 4. Geofence Verification Check
  if (roundedDistance > activeOffice.allowedRadius) {
    const error = new Error(
      `You are outside the office premises. Distance from office: ${Math.round(roundedDistance)}m (Allowed radius: ${activeOffice.allowedRadius}m).`
    );
    error.statusCode = 400;
    throw error;
  }

  // 5. Create Attendance Record
  const { dateOnly } = getTodayDateObj();
  const now = new Date();

  const newAttendance = await prisma.attendance.create({
    data: {
      userId,
      attendanceDate: dateOnly,
      punchInTime: now,
      latitude,
      longitude,
      distanceFromOffice: roundedDistance,
      isLocationVerified: true,
      status: 'PRESENT',
      deviceInfo: deviceInfo || null,
      ipAddress: ipAddress || '127.0.0.1'
    },
    include: {
      user: {
        select: {
          employeeId: true,
          firstName: true,
          lastName: true,
          department: true,
          designation: true
        }
      }
    }
  });

  // 6. Log Audit Entry
  await logAudit(
    userId,
    'PUNCH_IN',
    `Marked attendance PRESENT. Distance: ${roundedDistance}m from ${activeOffice.officeName}.`,
    ipAddress
  );

  return {
    attendance: newAttendance,
    office: activeOffice
  };
};

/**
 * Get attendance history for the logged-in employee
 */
const getMyAttendance = async (userId, query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const where = { userId };

  const [totalRecords, records] = await Promise.all([
    prisma.attendance.count({ where }),
    prisma.attendance.findMany({
      where,
      orderBy: { attendanceDate: 'desc' },
      skip,
      take: limit
    })
  ]);

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return {
    records,
    pagination: { totalRecords, totalPages, page, limit }
  };
};

/**
 * Admin view for company-wide attendance log
 */
const getAllAttendanceAdmin = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { search, department, status, date } = query;

  const where = {};

  if (search && search.trim() !== '') {
    const searchTerm = search.trim();
    where.user = {
      OR: [
        { employeeId: { contains: searchTerm, mode: 'insensitive' } },
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { department: { contains: searchTerm, mode: 'insensitive' } }
      ]
    };
  }

  if (department && department.trim() !== '') {
    where.user = { ...where.user, department: { equals: department.trim(), mode: 'insensitive' } };
  }

  if (status && ['PRESENT', 'ABSENT', 'LATE'].includes(status.toUpperCase())) {
    where.status = status.toUpperCase();
  }

  if (date) {
    const targetDate = new Date(date);
    if (!isNaN(targetDate.getTime())) {
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const day = targetDate.getDate();
      where.attendanceDate = {
        gte: new Date(year, month, day, 0, 0, 0, 0),
        lte: new Date(year, month, day, 23, 59, 59, 999)
      };
    }
  }

  const [totalRecords, records] = await Promise.all([
    prisma.attendance.count({ where }),
    prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
            designation: true,
            email: true,
            profilePhoto: true
          }
        }
      },
      orderBy: { punchInTime: 'desc' },
      skip,
      take: limit
    })
  ]);

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return {
    records,
    pagination: { totalRecords, totalPages, page, limit }
  };
};

module.exports = {
  getTodayStatus,
  punchIn,
  getMyAttendance,
  getAllAttendanceAdmin
};
