const prisma = require('../config/prisma');
const { logAudit } = require('../utils/auditLogger');

/**
 * Get Company Settings (or initialize default)
 */
const getCompanySettings = async () => {
  let settings = await prisma.companySettings.findFirst();

  if (!settings) {
    settings = await prisma.companySettings.create({
      data: {
        companyName: 'Landmark Developers',
        companyEmail: 'contact@landmarkdevelopers.com',
        companyPhone: '+91-11-23456789',
        website: 'https://landmarkdevelopers.com',
        supportEmail: 'support@landmarkdevelopers.com',
        timezone: 'Asia/Kolkata',
        defaultStartTime: '09:00 AM',
        defaultEndTime: '06:00 PM',
        companyAddress: 'Landmark Towers, Barakhamba Road, Connaught Place, New Delhi, 110001'
      }
    });
  }

  return settings;
};

/**
 * Update Company Settings & Branding
 */
const updateCompanySettings = async (data, adminUserId, ipAddress) => {
  const current = await getCompanySettings();

  const updated = await prisma.companySettings.update({
    where: { id: current.id },
    data: {
      companyName: data.companyName ? data.companyName.trim() : current.companyName,
      companyLogo: data.companyLogo !== undefined ? data.companyLogo : current.companyLogo,
      companyEmail: data.companyEmail ? data.companyEmail.trim() : current.companyEmail,
      companyPhone: data.companyPhone ? data.companyPhone.trim() : current.companyPhone,
      website: data.website ? data.website.trim() : current.website,
      supportEmail: data.supportEmail ? data.supportEmail.trim() : current.supportEmail,
      timezone: data.timezone ? data.timezone.trim() : current.timezone,
      defaultStartTime: data.defaultStartTime ? data.defaultStartTime.trim() : current.defaultStartTime,
      defaultEndTime: data.defaultEndTime ? data.defaultEndTime.trim() : current.defaultEndTime,
      companyAddress: data.companyAddress ? data.companyAddress.trim() : current.companyAddress
    }
  });

  await logAudit(
    adminUserId,
    'COMPANY_SETTINGS_UPDATED',
    `Updated corporate settings & branding for ${updated.companyName}`,
    ipAddress
  );

  return updated;
};

module.exports = {
  getCompanySettings,
  updateCompanySettings
};
