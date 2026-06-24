// src/controllers/auth.controller.js
// Auth controller — Register, Login, Logout, Get Profile, Update Profile

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// ─────────────────────────────────────────────
// Helper — Generate JWT Token
// ─────────────────────────────────────────────
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─────────────────────────────────────────────
// Safe user object (tanpa password)
// ─────────────────────────────────────────────
const safeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// ─────────────────────────────────────────────
// @desc    Register mahasiswa baru
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { nama, email, password, nim, jurusan, universitas, whatsapp } = req.body;

  // Cek email sudah terdaftar
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return errorResponse(res, 409, 'Email sudah terdaftar. Silakan gunakan email lain.');
  }

  // Cek NIM jika diisi
  if (nim) {
    const existingNim = await prisma.user.findUnique({ where: { nim } });
    if (existingNim) {
      return errorResponse(res, 409, 'NIM sudah terdaftar.');
    }
  }

  // Hash password (cost factor 12)
  const hashedPassword = await bcrypt.hash(password, 12);

  // Validasi email kampus
  if (!email.toLowerCase().trim().endsWith('.ac.id')) {
    return errorResponse(res, 400, 'Hanya email kampus (.ac.id) yang diizinkan untuk mendaftar.');
  }

  // Karena semua harus pakai email kampus, otomatis verified
  const isVerified = true;

  // Buat user baru
  const user = await prisma.user.create({
    data: {
      nama:        nama.trim(),
      email:       email.toLowerCase().trim(),
      password:    hashedPassword,
      nim:         nim ? nim.trim() : null,
      jurusan:     jurusan ? jurusan.trim() : null,
      universitas: universitas ? universitas.trim() : null,
      whatsapp:    whatsapp ? whatsapp.trim() : null,
      role:        'MAHASISWA',
      isVerified:  isVerified,
    },
  });

  const token = generateToken(user.id, user.role);

  return successResponse(res, 201, 'Registrasi berhasil! Selamat bergabung.', {
    user: safeUser(user),
    token,
  });
});

// ─────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Cari user berdasarkan email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // Pesan error sama untuk keamanan (tidak membedakan email/password salah)
  if (!user) {
    return errorResponse(res, 401, 'Email atau password salah.');
  }

  // Verifikasi password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, 401, 'Email atau password salah.');
  }

  if (user.isSuspended) {
    return errorResponse(res, 403, 'Akun Anda telah di-suspend oleh Admin.');
  }

  const token = generateToken(user.id, user.role);

  return successResponse(res, 200, `Selamat datang kembali, ${user.nama.split(' ')[0]}!`, {
    user: safeUser(user),
    token,
  });
});

// ─────────────────────────────────────────────
// @desc    Logout (instruksi hapus token di client)
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  // Karena JWT stateless, logout dilakukan di client dengan menghapus token.
  // Endpoint ini hanya memberi konfirmasi server-side.
  return successResponse(res, 200, 'Berhasil keluar. Sampai jumpa!');
});

// ─────────────────────────────────────────────
// @desc    Get profil user yang sedang login
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id:         true,
      nama:       true,
      nim:        true,
      jurusan:    true,
      email:      true,
      whatsapp:   true,
      fotoProfil: true,
      role:       true,
      createdAt:  true,
      updatedAt:  true,
    },
  });

  if (!user) {
    return errorResponse(res, 404, 'User tidak ditemukan.');
  }

  return successResponse(res, 200, 'Data profil berhasil diambil.', user);
});

// ─────────────────────────────────────────────
// @desc    Update profil user
// @route   PATCH /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { nama, jurusan, whatsapp, fotoProfil } = req.body;

  // Validasi minimal
  if (nama && nama.trim().length < 3) {
    return errorResponse(res, 422, 'Nama minimal 3 karakter.');
  }

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(nama       && { nama: nama.trim() }),
      ...(jurusan    && { jurusan: jurusan.trim() }),
      ...(whatsapp   && { whatsapp: whatsapp.trim() }),
      ...(fotoProfil && { fotoProfil }),
    },
    select: {
      id:         true,
      nama:       true,
      nim:        true,
      jurusan:    true,
      email:      true,
      whatsapp:   true,
      fotoProfil: true,
      role:       true,
      createdAt:  true,
      updatedAt:  true,
    },
  });

  return successResponse(res, 200, 'Profil berhasil diperbarui.', updated);
});

// ─────────────────────────────────────────────
// @desc    Ganti password
// @route   PATCH /api/auth/change-password
// @access  Private
// ─────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return errorResponse(res, 400, 'Password lama dan password baru wajib diisi.');
  }

  if (newPassword.length < 8) {
    return errorResponse(res, 422, 'Password baru minimal 8 karakter.');
  }

  // Ambil user dengan password
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return errorResponse(res, 401, 'Password lama tidak sesuai.');
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashed },
  });

  return successResponse(res, 200, 'Password berhasil diubah.');
});

module.exports = { register, login, logout, getMe, updateProfile, changePassword };
