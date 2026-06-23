// src/controllers/report.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// POST /api/reports
const submitReport = asyncHandler(async (req, res) => {
  const { reportedId, reason, description } = req.body;
  const reporterId = req.user.id;

  if (reportedId === reporterId) {
    return errorResponse(res, 400, 'Anda tidak bisa melaporkan diri sendiri');
  }

  const reportedUser = await prisma.user.findUnique({ where: { id: reportedId } });
  if (!reportedUser) return errorResponse(res, 404, 'User yang dilaporkan tidak ditemukan');

  const report = await prisma.report.create({
    data: { reporterId, reportedId, reason, description }
  });

  return successResponse(res, 201, 'Laporan berhasil dikirim. Admin akan segera memprosesnya.', report);
});

// GET /api/reports
// Admin only
const getReports = asyncHandler(async (req, res) => {
  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { id: true, nama: true, email: true } },
      reported: { select: { id: true, nama: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  return successResponse(res, 200, 'Berhasil memuat laporan', reports);
});

// PUT /api/reports/:id/status
// Admin only
const updateReportStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const report = await prisma.report.update({
    where: { id },
    data: { status }
  });

  return successResponse(res, 200, 'Status laporan berhasil diperbarui', report);
});

module.exports = {
  submitReport,
  getReports,
  updateReportStatus
};
