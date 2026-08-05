const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Yalnız autentifikasiyadan keçmiş adminlər baxa bilər
router.get('/', protect, adminOnly, getAuditLogs);

module.exports = router;