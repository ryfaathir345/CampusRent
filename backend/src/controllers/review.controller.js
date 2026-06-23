// src/controllers/review.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { logActivity } = require('./profile.controller');

// POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { transactionId, rating, comment } = req.body;
  const reviewerId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return errorResponse(res, 400, 'Rating harus antara 1 dan 5');
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { item: true }
  });

  if (!transaction) return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  if (transaction.status !== 'COMPLETED') return errorResponse(res, 400, 'Review hanya bisa diberikan pada transaksi yang sudah selesai');

  // Tentukan reviewee: Jika saya peminjam, maka reviewee adalah owner barang, dan sebaliknya
  let revieweeId;
  if (transaction.borrowerId === reviewerId) {
    revieweeId = transaction.item.ownerId;
  } else if (transaction.item.ownerId === reviewerId) {
    revieweeId = transaction.borrowerId;
  } else {
    return errorResponse(res, 403, 'Anda bukan bagian dari transaksi ini');
  }

  // Cek apakah sudah memberikan review
  const existingReview = await prisma.review.findUnique({
    where: { 
      transactionId_reviewerId: {
        transactionId,
        reviewerId
      }
    }
  });

  if (existingReview) {
    return errorResponse(res, 400, 'Anda sudah memberikan ulasan untuk transaksi ini');
  }

  const review = await prisma.review.create({
    data: {
      transactionId,
      reviewerId,
      revieweeId,
      itemId: transaction.itemId,
      rating: parseInt(rating),
      comment
    }
  });

  await logActivity(reviewerId, `Memberikan ulasan bintang ${rating} kepada ${revieweeId === transaction.borrowerId ? 'peminjam' : 'pemilik barang'}`);

  // Kirim notifikasi ke reviewee
  await prisma.notification.create({
    data: {
      userId: revieweeId,
      title: 'Ulasan Baru',
      message: `${req.user.nama} telah memberikan ulasan bintang ${rating} pada transaksi barang ${transaction.item.namaBarang}`
    }
  });

  return successResponse(res, 201, 'Ulasan berhasil disimpan', review);
});

// GET /api/reviews/user/:userId
const getUserReviews = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    include: {
      reviewer: { select: { id: true, nama: true, fotoProfil: true } },
      item: { select: { id: true, namaBarang: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return successResponse(res, 200, 'Berhasil memuat ulasan', {
    avgRating,
    totalReviews: reviews.length,
    reviews
  });
});

// GET /api/reviews/item/:itemId
const getItemReviews = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { itemId },
    include: {
      reviewer: { select: { id: true, nama: true, fotoProfil: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return successResponse(res, 200, 'Berhasil memuat ulasan barang', {
    avgRating,
    totalReviews: reviews.length,
    reviews
  });
});

module.exports = {
  createReview,
  getUserReviews,
  getItemReviews
};
