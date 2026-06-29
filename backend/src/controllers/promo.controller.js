const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { successResponse, errorResponse } = require('../utils/response');
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/promos
const getPromos = asyncHandler(async (req, res) => {
  const promos = await prisma.promo.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return successResponse(res, 200, 'Berhasil memuat daftar promo', promos);
});

// GET /api/promos/active
const getActivePromos = asyncHandler(async (req, res) => {
  const promos = await prisma.promo.findMany({
    where: {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });
  return successResponse(res, 200, 'Berhasil memuat daftar promo aktif', promos);
});

// POST /api/promos/validate
const validatePromo = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  const promo = await prisma.promo.findUnique({
    where: { code }
  });

  if (!promo) {
    return res.status(404).json({ success: false, message: 'Kode promo tidak ditemukan' });
  }

  if (!promo.isActive) {
    return res.status(400).json({ success: false, message: 'Kode promo sudah tidak aktif' });
  }

  const now = new Date();
  if (now < promo.startDate) {
    return res.status(400).json({ success: false, message: 'Kode promo belum bisa digunakan' });
  }
  if (now > promo.endDate) {
    return res.status(400).json({ success: false, message: 'Kode promo sudah kedaluwarsa' });
  }

  // Cek apakah user sudah pernah menggunakan promo ini
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      borrowerId: userId,
      promoId: promo.id,
      status: {
        not: 'REJECTED' // Jika rejected, mungkin masih bisa pakai lagi, tapi amannya kita hitung selain rejected
      }
    }
  });

  if (existingTransaction) {
    return res.status(400).json({ success: false, message: 'Anda sudah pernah menggunakan kode promo ini' });
  }

  return successResponse(res, 200, 'Kode promo valid', promo);
});

// POST /api/promos
const createPromo = asyncHandler(async (req, res) => {
  const { code, title, description, discountPercent, maxDiscount, startDate, endDate, isActive } = req.body;
  let bannerImage = null;

  if (req.files && req.files.bannerImage) {
    bannerImage = `/uploads/${req.files.bannerImage[0].filename}`;
  }

  const existingPromo = await prisma.promo.findUnique({ where: { code } });
  if (existingPromo) {
    return res.status(400).json({ success: false, message: 'Kode promo sudah ada' });
  }

  const promo = await prisma.promo.create({
    data: {
      code,
      title,
      description,
      discountPercent: parseInt(discountPercent),
      maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive === 'true' || isActive === true,
      bannerImage
    }
  });

  return successResponse(res, 201, 'Promo berhasil ditambahkan', promo);
});

// PUT /api/promos/:id
const updatePromo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, title, description, discountPercent, maxDiscount, startDate, endDate, isActive } = req.body;
  let bannerImage = undefined;

  if (req.files && req.files.bannerImage) {
    bannerImage = `/uploads/${req.files.bannerImage[0].filename}`;
  }

  const promo = await prisma.promo.update({
    where: { id },
    data: {
      code,
      title,
      description,
      discountPercent: parseInt(discountPercent),
      maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive === 'true' || isActive === true,
      ...(bannerImage !== undefined && { bannerImage })
    }
  });

  return successResponse(res, 200, 'Promo berhasil diperbarui', promo);
});

// DELETE /api/promos/:id
const deletePromo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.promo.delete({ where: { id } });
  return successResponse(res, 200, 'Promo berhasil dihapus', null);
});

module.exports = {
  getPromos,
  getActivePromos,
  validatePromo,
  createPromo,
  updatePromo,
  deletePromo
};
