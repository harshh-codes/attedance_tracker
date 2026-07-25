const analyticsService = require('../services/analytics.service');
const exportService = require('../services/export.service');

/**
 * @desc    Get Today's Summary Metrics Cards
 * @route   GET /api/admin/attendance/summary
 * @access  Private (ADMIN)
 */
const getSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.getTodaySummaryMetrics();
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Comprehensive Monthly & Trend Analytics for Charts
 * @route   GET /api/admin/attendance/analytics
 * @access  Private (ADMIN)
 */
const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getAnalyticsData(req.query);
    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export Attendance Report as CSV
 * @route   GET /api/admin/attendance/export/csv
 * @access  Private (ADMIN)
 */
const exportCSV = async (req, res, next) => {
  try {
    const { buffer, filename } = await exportService.exportCSV(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export Attendance Report as Excel (.xlsx)
 * @route   GET /api/admin/attendance/export/excel
 * @access  Private (ADMIN)
 */
const exportExcel = async (req, res, next) => {
  try {
    const { buffer, filename } = await exportService.exportExcel(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export Attendance Report as Printable Document (PDF / HTML)
 * @route   GET /api/admin/attendance/export/pdf
 * @access  Private (ADMIN)
 */
const exportPDF = async (req, res, next) => {
  try {
    const { buffer, filename } = await exportService.exportPDF(req.query);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getAnalytics,
  exportCSV,
  exportExcel,
  exportPDF
};
