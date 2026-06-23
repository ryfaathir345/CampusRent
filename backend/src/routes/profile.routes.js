// src/routes/profile.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/multer');
const {
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
  getActivities,
  updateKtm
} = require('../controllers/profile.controller');

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/avatar', upload.single('fotoProfil'), updateAvatar);
router.put('/password', changePassword);
router.put('/ktm', upload.single('ktmUrl'), updateKtm);
router.get('/activities', getActivities);

module.exports = router;
