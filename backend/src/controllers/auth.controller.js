// src/controllers/auth.controller.js
// Auth controller — Register, Login, Logout, Get Profile, Update Profile

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/database');
const sendEmail = require('../utils/sendEmail');
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

  // Simpan currentLoginToken setelah register agar perangkat lain tidak bisa sembarangan login
  await prisma.user.update({
    where: { id: user.id },
    data: { currentLoginToken: token }
  });

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

  // Check if there's an active login token
  if (user.currentLoginToken) {
    try {
      jwt.verify(user.currentLoginToken, process.env.JWT_SECRET);
      // If verification succeeds, token is still active and valid!
      return errorResponse(res, 403, 'Akun ini sedang digunakan di perangkat lain. Harap log out terlebih dahulu.');
    } catch (err) {
      // If token verification fails (expired or invalid), it means the previous session is dead.
      // We can safely allow login to proceed.
    }
  }

  const token = generateToken(user.id, user.role);

  // Update last active AND the current login token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastActiveAt: new Date(),
      currentLoginToken: token
    }
  });

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
  // Hapus currentLoginToken di database agar akun bisa dipakai login lagi
  if (req.user && req.user.id) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        currentLoginToken: null
      }
    });
  }

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

// ─────────────────────────────────────────────
// @desc    Lupa password (Request reset link)
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return errorResponse(res, 400, 'Email wajib diisi.');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return errorResponse(res, 404, 'Akun dengan email tersebut tidak ditemukan.');
  }

  // Buat token acak
  const resetToken = crypto.randomBytes(32).toString('hex');
  // Hash token sebelum disimpan ke DB untuk keamanan
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Set kedaluwarsa 1 jam dari sekarang
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry
    }
  });

  // URL frontend untuk mereset password
  // Ambil dari variabel lingkungan atau gunakan default frontend lokal
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  try {
    // Kirim email
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Pemulihan Kata Sandi CampusRent</h2>
        <p>Halo, ${user.nama}!</p>
        <p>Anda menerima email ini karena Anda (atau seseorang) meminta pengaturan ulang kata sandi untuk akun CampusRent Anda.</p>
        <p>Silakan klik tombol di bawah ini untuk mengatur ulang kata sandi Anda. Tautan ini hanya berlaku selama <strong>1 jam</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Kata Sandi</a>
        </div>
        <p>Atau salin dan tempel tautan berikut di peramban Anda:</p>
        <p style="word-break: break-all; color: #6b7280; font-size: 14px;"><a href="${resetUrl}">${resetUrl}</a></p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af;">Jika Anda tidak meminta ini, abaikan saja email ini dan kata sandi Anda akan tetap aman.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Pemulihan Kata Sandi Akun CampusRent',
      html: message,
    });

    return successResponse(res, 200, 'Tautan reset password telah dikirim ke email Anda.');
  } catch (error) {
    // Jika gagal kirim email, hapus token di DB
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    
    console.error('Gagal mengirim email reset password:', error);
    return errorResponse(res, 500, 'Gagal mengirim email. Silakan coba lagi nanti.');
  }
});

// ─────────────────────────────────────────────
// @desc    Reset password menggunakan token
// @route   POST /api/auth/reset-password
// @access  Public
// ─────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return errorResponse(res, 400, 'Token dan password baru wajib diisi.');
  }

  if (newPassword.length < 8) {
    return errorResponse(res, 422, 'Password baru minimal 8 karakter.');
  }

  // Hash token dari input untuk dicocokkan dengan yang di database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Cari user dengan token ini dan belum kedaluwarsa
  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: { gt: new Date() } // expiry > waktu saat ini
    }
  });

  if (!user) {
    return errorResponse(res, 400, 'Token tidak valid atau sudah kedaluwarsa.');
  }

  // Update password baru dan hapus token
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    }
  });

  return successResponse(res, 200, 'Password berhasil direset. Silakan login dengan password baru.');
});

module.exports = { register, login, logout, getMe, updateProfile, changePassword, forgotPassword, resetPassword };
