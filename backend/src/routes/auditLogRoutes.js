const express = require('express');
const orderRoutes = require('./routes/orderRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes'); // <-- 1. BUNU ƏLAVƏ ET
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect, adminOnly } = require('../middleware/authMiddleware'); // Təhlükəsizlik middleware-ləri

// Yalnız autentifikasiyadan keçmiş adminlər baxa bilər
router.get('/', protect, adminOnly, getAuditLogs);

module.exports = router;