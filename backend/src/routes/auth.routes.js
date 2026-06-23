// src/routes/auth.routes.js
// Auth routes — Register, Login, Logout, Profile

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

// ── Public routes ───────────────────────────
router.post('/register', validateRegister, register);
router.post('/login',    validateLogin,    login);

// ── Protected routes (harus login) ─────────
router.post('/logout',          protect, logout);
router.get('/me',               protect, getMe);
router.patch('/profile',        protect, updateProfile);
router.patch('/change-password', protect, changePassword);

module.exports = router;
