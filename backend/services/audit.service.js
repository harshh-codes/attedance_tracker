const prisma = require('../config/prisma');

/**
 * Fetch paginated system audit logs for administrators
 */
const getAuditLogs = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { search, role, action, date } = query;

  const where = {};

  if (search && search.trim() !== '') {
    const searchTerm = search.trim();
    where.OR = [
      { action: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      {
        user: {
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { employeeId: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } }
          ]
        }
      }
    ];
  }

  if (action && action.trim() !== '') {
    where.action = { equals: action.trim().toUpperCase() };
  }

  if (role && ['ADMIN', 'EMPLOYEE'].includes(role.toUpperCase())) {
    where.user = { ...where.user, role: role.toUpperCase() };
  }

  if (date) {
    const targetDate = new Date(date);
    if (!isNaN(targetDate.getTime())) {
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const day = targetDate.getDate();
      where.createdAt = {
        gte: new Date(year, month, day, 0, 0, 0, 0),
        lte: new Date(year, month, day, 23, 59, 59, 999)
      };
    }
  }

  const [totalRecords, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ]);

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return {
    logs,
    pagination: { totalRecords, totalPages, page, limit }
  };
};

module.exports = {
  getAuditLogs
};
