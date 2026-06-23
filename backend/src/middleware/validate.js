// src/middleware/validate.js
// Request body validation middleware

const { errorResponse } = require('../utils/response');

/**
 * Validate register request body
 */
const validateRegister = (req, res, next) => {
  const { nama, email, password, nim, whatsapp } = req.body;
  const errors = {};

  // nama
  if (!nama || typeof nama !== 'string' || nama.trim().length < 3) {
    errors.nama = 'Nama lengkap minimal 3 karakter';
  } else if (nama.trim().length > 100) {
    errors.nama = 'Nama maksimal 100 karakter';
  }

  // email
  if (!email) {
    errors.email = 'Email wajib diisi';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Format email tidak valid';
  }

  // password
  if (!password) {
    errors.password = 'Password wajib diisi';
  } else if (password.length < 8) {
    errors.password = 'Password minimal 8 karakter';
  } else if (password.length > 72) {
    errors.password = 'Password terlalu panjang';
  }

  // nim (optional, tapi jika diisi harus valid)
  if (nim && !/^\d{5,20}$/.test(nim.trim())) {
    errors.nim = 'NIM harus berupa angka (5-20 digit)';
  }

  // whatsapp (optional, tapi jika diisi harus valid)
  if (whatsapp && !/^(\+62|08)\d{7,13}$/.test(whatsapp.trim())) {
    errors.whatsapp = 'Format nomor WhatsApp tidak valid (contoh: 08xxxxxxxxxx)';
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse(res, 422, 'Validasi gagal', errors);
  }

  next();
};

/**
 * Validate login request body
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email) {
    errors.email = 'Email wajib diisi';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Format email tidak valid';
  }

  if (!password) {
    errors.password = 'Password wajib diisi';
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse(res, 422, 'Validasi gagal', errors);
  }

  next();
};

module.exports = { validateRegister, validateLogin };
