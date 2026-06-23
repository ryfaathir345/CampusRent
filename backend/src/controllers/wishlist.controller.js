// src/controllers/wishlist.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/wishlists
const getWishlist = asyncHandler(async (req, res) => {
  const wishlists = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: {
      item: {
        include: {
          owner: { select: { id: true, nama: true, universitas: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return successResponse(res, 200, 'Berhasil memuat wishlist', wishlists);
});

// POST /api/wishlists/:itemId
const toggleWishlist = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return errorResponse(res, 404, 'Barang tidak ditemukan');

  const existing = await prisma.wishlist.findUnique({
    where: { userId_itemId: { userId, itemId } }
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return successResponse(res, 200, 'Dihapus dari wishlist');
  } else {
    const wish = await prisma.wishlist.create({
      data: { userId, itemId }
    });
    return successResponse(res, 201, 'Ditambahkan ke wishlist', wish);
  }
});

module.exports = {
  getWishlist,
  toggleWishlist
};
