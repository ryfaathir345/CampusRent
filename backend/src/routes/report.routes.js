// src/routes/report.routes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { submitReport, getReports, updateReportStatus } = require('../controllers/report.controller');

router.use(protect);

router.post('/', submitReport);
router.get('/', isAdmin, getReports);
router.put('/:id/status', isAdmin, updateReportStatus);

module.exports = router;
