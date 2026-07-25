const prisma = require('../config/prisma');
const { logAudit } = require('../utils/auditLogger');

/**
 * Fetch active office settings
 */
const getOfficeSettings = async () => {
  let office = await prisma.officeLocation.findFirst({
    where: { isActive: true }
  });

  if (!office) {
    // Fallback to any office record or default
    office = await prisma.officeLocation.findFirst() || {
      officeName: 'Landmark Developers HQ',
      latitude: 28.6139,
      longitude: 77.2090,
      allowedRadius: 200.0,
      address: 'Landmark Towers, Barakhamba Road, Connaught Place, New Delhi, 110001',
      workingHours: '09:00 AM - 06:00 PM',
      timezone: 'Asia/Kolkata',
      isActive: true
    };
  }

  return office;
};

/**
 * Update office settings & geofence configuration
 */
const updateOfficeSettings = async (data, adminUserId, ipAddress) => {
  const latitude = parseFloat(data.latitude);
  const longitude = parseFloat(data.longitude);
  const allowedRadius = parseFloat(data.allowedRadius);

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    const error = new Error('Latitude must be a valid coordinate between -90 and 90');
    error.statusCode = 400;
    throw error;
  }

  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    const error = new Error('Longitude must be a valid coordinate between -180 and 180');
    error.statusCode = 400;
    throw error;
  }

  if (isNaN(allowedRadius) || allowedRadius <= 0) {
    const error = new Error('Allowed radius must be greater than 0 meters');
    error.statusCode = 400;
    throw error;
  }

  // Ensure only one office is active
  const activeOffice = await prisma.officeLocation.findFirst({ where: { isActive: true } });

  let updatedOffice;
  if (activeOffice) {
    updatedOffice = await prisma.officeLocation.update({
      where: { id: activeOffice.id },
      data: {
        officeName: data.officeName ? data.officeName.trim() : activeOffice.officeName,
        address: data.address ? data.address.trim() : activeOffice.address,
        latitude,
        longitude,
        allowedRadius,
        workingHours: data.workingHours ? data.workingHours.trim() : activeOffice.workingHours,
        timezone: data.timezone ? data.timezone.trim() : activeOffice.timezone,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
      }
    });
  } else {
    updatedOffice = await prisma.officeLocation.create({
      data: {
        officeName: data.officeName ? data.officeName.trim() : 'Landmark Developers HQ',
        address: data.address ? data.address.trim() : 'Landmark Towers, CP, New Delhi',
        latitude,
        longitude,
        allowedRadius,
        workingHours: data.workingHours ? data.workingHours.trim() : '09:00 AM - 06:00 PM',
        timezone: data.timezone ? data.timezone.trim() : 'Asia/Kolkata',
        isActive: true
      }
    });
  }

  await logAudit(
    adminUserId,
    'OFFICE_SETTINGS_UPDATED',
    `Updated office coordinates (${latitude}, ${longitude}) & radius (${allowedRadius}m) for ${updatedOffice.officeName}`,
    ipAddress
  );

  return updatedOffice;
};

module.exports = {
  getOfficeSettings,
  updateOfficeSettings
};
