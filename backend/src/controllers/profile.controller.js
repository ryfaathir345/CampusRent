// src/controllers/profile.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const logActivity = async (userId, action) => {
  await prisma.activityLog.create({
    data: { userId, action }
  });
};

const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, nama: true, nim: true, jurusan: true, universitas: true,
      email: true, whatsapp: true, fotoProfil: true, role: true,
      createdAt: true, isVerified: true, ktmUrl: true,
      reviewsGot: { select: { rating: true } },
      borrowings: {
        where: { status: { in: ['RETURNED', 'COMPLETED'] } },
        select: { actualReturnDate: true, endDate: true }
      },
      items: {
        select: { _count: { select: { transactions: true } } }
      }
    }
  });

  if (!user) return errorResponse(res, 404, 'User tidak ditemukan');

  // Calculate Trust Score and Badges
  let totalRating = 0;
  user.reviewsGot.forEach(r => totalRating += r.rating);
  const avgRating = user.reviewsGot.length > 0 ? totalRating / user.reviewsGot.length : 0;

  let onTimeReturns = 0;
  user.borrowings.forEach(b => {
    if (b.actualReturnDate && b.actualReturnDate <= b.endDate) {
      onTimeReturns++;
    }
  });
  const returnPercentage = user.borrowings.length > 0 ? (onTimeReturns / user.borrowings.length) * 100 : 0;
  
  let totalLends = 0;
  user.items.forEach(i => totalLends += i._count.transactions);

  const badges = [];
  if (returnPercentage >= 90 && user.borrowings.length >= 3 && avgRating >= 4.0) {
    badges.push('Trusted Borrower');
  }
  if (totalLends >= 3 && avgRating >= 4.0) {
    badges.push('Helpful Lender');
  }
  if (user.borrowings.length > 0 && returnPercentage === 100) {
    badges.push('Fast Returner');
  }

  const { reviewsGot, borrowings, items, ...safeUser } = user;
  const profileData = {
    ...safeUser,
    trustScore: avgRating,
    returnPercentage,
    badges,
    totalReviews: reviewsGot.length
  };

  return successResponse(res, 200, 'Berhasil memuat profil', profileData);
});

// PUT /api/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { nama, jurusan, universitas, whatsapp } = req.body;
  const userId = req.user.id;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(nama && { nama }),
      ...(jurusan && { jurusan }),
      ...(universitas && { universitas }),
      ...(whatsapp && { whatsapp })
    },
    select: {
      id: true, nama: true, nim: true, jurusan: true, universitas: true,
      email: true, whatsapp: true, fotoProfil: true, role: true
    }
  });

  await logActivity(userId, 'Memperbarui biodata profil');

  return successResponse(res, 200, 'Profil berhasil diperbarui', updatedUser);
});

// PUT /api/profile/avatar
const updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!req.file) return errorResponse(res, 400, 'Foto tidak ditemukan');

  const fotoProfil = `/uploads/${req.file.filename}`;

  // Ambil user untuk cek foto lama
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.fotoProfil) {
    try {
      const oldPath = path.join(__dirname, '../../public', user.fotoProfil.trim());
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    } catch (error) {
      console.error('Error deleting old avatar:', error);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { fotoProfil },
    select: { id: true, nama: true, email: true, fotoProfil: true }
  });

  await logActivity(userId, 'Memperbarui foto profil');

  return successResponse(res, 200, 'Foto profil berhasil diperbarui', updatedUser);
});

// PUT /api/profile/password
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword) return errorResponse(res, 400, 'Password lama dan baru wajib diisi');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return errorResponse(res, 400, 'Password lama tidak sesuai');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  await logActivity(userId, 'Mengubah password akun');

  return successResponse(res, 200, 'Password berhasil diubah');
});

// GET /api/profile/activities
const getActivities = asyncHandler(async (req, res) => {
  const logs = await prisma.activityLog.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return successResponse(res, 200, 'Berhasil memuat aktivitas', logs);
});

// PUT /api/profile/ktm
const updateKtm = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!req.file) return errorResponse(res, 400, 'Foto KTM tidak ditemukan');

  const ktmUrl = `/uploads/${req.file.filename}`;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.ktmUrl) {
    try {
      const oldPath = path.join(__dirname, '../../public', user.ktmUrl.trim());
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    } catch (error) {
      console.error('Error deleting old KTM:', error);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { ktmUrl },
    select: { id: true, nama: true, email: true, isVerified: true, ktmUrl: true }
  });

  await logActivity(userId, 'Mengunggah foto KTM');

  return successResponse(res, 200, 'KTM berhasil diunggah, menunggu verifikasi admin', updatedUser);
});

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
  getActivities,
  updateKtm,
  logActivity
};
