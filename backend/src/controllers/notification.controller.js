// src/controllers/notification.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return successResponse(res, 200, 'Berhasil mengambil notifikasi', notifications);
});

// PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return errorResponse(res, 404, 'Notifikasi tidak ditemukan');
  if (notification.userId !== req.user.id) return errorResponse(res, 403, 'Akses ditolak');

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

  return successResponse(res, 200, 'Notifikasi telah dibaca', updated);
});

// PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true }
  });

  return successResponse(res, 200, 'Semua notifikasi telah dibaca');
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
