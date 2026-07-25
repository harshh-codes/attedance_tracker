const prisma = require('../config/prisma');
const XLSX = require('xlsx');

/**
 * Fetch filtered attendance records for report exporting
 */
const getFilteredAttendanceRecords = async (query) => {
  const { date, startDate, endDate, department, status, type } = query;

  const where = {};

  // Preset Date Type Filters (today, weekly, monthly)
  const now = new Date();
  if (type === 'today') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    where.attendanceDate = {
      gte: new Date(year, month, day, 0, 0, 0, 0),
      lte: new Date(year, month, day, 23, 59, 59, 999)
    };
  } else if (type === 'weekly') {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    where.attendanceDate = { gte: sevenDaysAgo, lte: now };
  } else if (type === 'monthly') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    where.attendanceDate = { gte: startOfMonth, lte: now };
  } else if (startDate && endDate) {
    where.attendanceDate = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  } else if (date) {
    const d = new Date(date);
    where.attendanceDate = {
      gte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
      lte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
    };
  }

  if (department && department.trim() !== '') {
    where.user = { department: { equals: department.trim(), mode: 'insensitive' } };
  }

  if (status && ['PRESENT', 'ABSENT', 'LATE'].includes(status.toUpperCase())) {
    where.status = status.toUpperCase();
  }

  const records = await prisma.attendance.findMany({
    where,
    include: {
      user: {
        select: {
          employeeId: true,
          firstName: true,
          lastName: true,
          department: true,
          designation: true,
          email: true
        }
      }
    },
    orderBy: { punchInTime: 'desc' }
  });

  return records.map(rec => ({
    employeeId: rec.user?.employeeId || 'N/A',
    employeeName: rec.user ? `${rec.user.firstName} ${rec.user.lastName}` : 'N/A',
    department: rec.user?.department || 'N/A',
    designation: rec.user?.designation || 'N/A',
    email: rec.user?.email || 'N/A',
    date: new Date(rec.attendanceDate).toISOString().split('T')[0],
    punchInTime: new Date(rec.punchInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
    status: rec.status,
    distanceFromOfficeMeters: rec.distanceFromOffice,
    locationVerified: rec.isLocationVerified ? 'YES' : 'NO',
    ipAddress: rec.ipAddress || '127.0.0.1',
    deviceInfo: rec.deviceInfo ? rec.deviceInfo.slice(0, 50) : 'Browser'
  }));
};

/**
 * Export attendance records as RFC-4180 CSV
 */
const exportCSV = async (query) => {
  const data = await getFilteredAttendanceRecords(query);

  const headers = [
    'Employee ID', 'Employee Name', 'Department', 'Designation', 'Email',
    'Date', 'Punch In Time', 'Status', 'Distance (m)', 'Location Verified', 'IP Address', 'Device Info'
  ];

  const csvRows = [headers.join(',')];

  data.forEach(row => {
    const values = [
      `"${row.employeeId}"`,
      `"${row.employeeName}"`,
      `"${row.department}"`,
      `"${row.designation}"`,
      `"${row.email}"`,
      `"${row.date}"`,
      `"${row.punchInTime}"`,
      `"${row.status}"`,
      row.distanceFromOfficeMeters,
      `"${row.locationVerified}"`,
      `"${row.ipAddress}"`,
      `"${row.deviceInfo.replace(/"/g, '""')}"`
    ];
    csvRows.push(values.join(','));
  });

  return {
    buffer: Buffer.from(csvRows.join('\n')),
    filename: `attendance_report_${new Date().toISOString().split('T')[0]}.csv`
  };
};

/**
 * Export attendance records as native Excel (.xlsx) spreadsheet
 */
const exportExcel = async (query) => {
  const data = await getFilteredAttendanceRecords(query);

  const excelRows = data.map(row => ({
    'Employee ID': row.employeeId,
    'Employee Name': row.employeeName,
    'Department': row.department,
    'Designation': row.designation,
    'Email': row.email,
    'Date': row.date,
    'Punch In Time': row.punchInTime,
    'Status': row.status,
    'Distance (m)': row.distanceFromOfficeMeters,
    'Location Verified': row.locationVerified,
    'IP Address': row.ipAddress,
    'Device Info': row.deviceInfo
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return {
    buffer,
    filename: `landmark_attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`
  };
};

/**
 * Export attendance records as printable PDF / HTML document
 */
const exportPDF = async (query) => {
  const data = await getFilteredAttendanceRecords(query);

  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Landmark Developers - Attendance Report</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #1e293b; }
        .header { border-bottom: 3px solid #f59e0b; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
        .title { font-size: 22px; font-weight: bold; color: #0f172a; }
        .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
        th { background: #0f172a; color: #ffffff; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; }
        td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; }
        .status-present { color: #10b981; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">Landmark Developers</div>
          <div class="subtitle">Official HR Attendance Report • Generated: ${reportDate}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Emp ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Date</th>
            <th>Punch Time</th>
            <th>Status</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
  `;

  data.forEach(row => {
    htmlContent += `
      <tr>
        <td><strong>${row.employeeId}</strong></td>
        <td>${row.employeeName}</td>
        <td>${row.department}</td>
        <td>${row.designation}</td>
        <td>${row.date}</td>
        <td>${row.punchInTime}</td>
        <td class="status-present">${row.status}</td>
        <td>${row.distanceFromOfficeMeters}m</td>
      </tr>
    `;
  });

  htmlContent += `
        </tbody>
      </table>

      <div class="footer">
        © ${new Date().getFullYear()} Landmark Developers. Confidential Corporate HR System Report. Total Records: ${data.length}
      </div>
    </body>
    </html>
  `;

  return {
    buffer: Buffer.from(htmlContent),
    filename: `attendance_report_${new Date().toISOString().split('T')[0]}.html`
  };
};

module.exports = {
  exportCSV,
  exportExcel,
  exportPDF
};
