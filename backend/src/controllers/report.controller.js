// src/controllers/report.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// POST /api/reports
const submitReport = asyncHandler(async (req, res) => {
  const { reportedId, itemId, reason, description } = req.body;
  // frontend passes reportedUserId sometimes, but we map it as reportedId for users
  // However, frontend `ItemDetail.jsx` passes { reportedUserId: item.ownerId, reason, itemId }
  // So let's handle both reportedId and reportedUserId
  const actualReportedId = reportedId || req.body.reportedUserId;
  const reporterId = req.user.id;

  if (actualReportedId === reporterId && !itemId) {
    return errorResponse(res, 400, 'Anda tidak bisa melaporkan diri sendiri');
  }

  if (actualReportedId) {
    const reportedUser = await prisma.user.findUnique({ where: { id: actualReportedId } });
    if (!reportedUser) return errorResponse(res, 404, 'User yang dilaporkan tidak ditemukan');
  }

  if (itemId) {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return errorResponse(res, 404, 'Barang yang dilaporkan tidak ditemukan');
  }

  const report = await prisma.report.create({
    data: { reporterId, reportedId: actualReportedId, itemId, reason, description }
  });

  return successResponse(res, 201, 'Laporan berhasil dikirim. Admin akan segera memprosesnya.', report);
});

// GET /api/reports
// Admin only
const getReports = asyncHandler(async (req, res) => {
  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { id: true, nama: true, email: true } },
      reported: { select: { id: true, nama: true, email: true } },
      item: { select: { id: true, namaBarang: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Map to add targetType and targetId for AdminReports
  const mappedReports = reports.map(r => ({
    ...r,
    targetType: r.itemId ? 'ITEM' : 'USER',
    targetId: r.itemId ? r.item.namaBarang : (r.reported?.nama || 'Unknown User')
  }));

  return successResponse(res, 200, 'Berhasil memuat laporan', mappedReports);
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
