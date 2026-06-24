// src/middleware/auth.js
// JWT Authentication & Role-based Authorization middleware

const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');
const prisma = require('../config/database');

// ─────────────────────────────────────────────
// protect — Wajib login (valid JWT)
// ─────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // Ambil token dari header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Akses ditolak. Silakan login terlebih dahulu.');
    }

    // Verifikasi token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Sesi telah berakhir. Silakan login ulang.');
      }
      return errorResponse(res, 401, 'Token tidak valid. Silakan login ulang.');
    }

    // Cek apakah user masih ada dan ambil isSuspended
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return errorResponse(res, 401, 'Akun tidak ditemukan. Silakan login ulang.');
    }

    // Update lastActiveAt jika sudah lebih dari 5 menit untuk mengurangi beban database
    const now = new Date();
    const lastActive = new Date(user.lastActiveAt);
    const diffMinutes = Math.floor((now - lastActive) / 1000 / 60);
    
    if (diffMinutes > 5) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: now }
      });
      user.lastActiveAt = now;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// restrictTo — Batasi akses berdasarkan role
// Contoh: restrictTo('ADMIN') atau restrictTo('ADMIN', 'MAHASISWA')
// ─────────────────────────────────────────────
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        'Akses ditolak. Kamu tidak memiliki izin untuk melakukan tindakan ini.'
      );
    }
    next();
  };
};

// ─────────────────────────────────────────────
// isSelf — Pastikan user hanya mengakses data miliknya
// ─────────────────────────────────────────────
const isSelf = (req, res, next) => {
  const targetId = req.params.id;
  if (req.user.role !== 'ADMIN' && req.user.role !== 'admin' && req.user.id !== targetId) {
    return errorResponse(res, 403, 'Kamu hanya bisa mengakses data milikmu sendiri.');
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Akses khusus Administrator.');
  }
  next();
};

module.exports = { protect, restrictTo, isSelf, isAdmin };
