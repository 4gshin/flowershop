// utils/logger.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Prisma ilə Otomatik Audit Log Yazan Köməkçi Funksiya
 */
const createAuditLog = async (req, action, details) => {
  try {
    // Prisma schema-ndakı model adına uyğun olaraq (auditLog və ya AuditLog)
    await prisma.auditLog.create({
      data: {
        userId: req.user ? req.user.id || req.user._id : null,
        userEmail: req.user ? req.user.email || req.user.eposta : 'Sistem / Anonim',
        action: action, // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
        details: details,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    });
  } catch (error) {
    console.error('Audit Log yazılırken hata oluştu:', error.message);
  }
};

module.exports = createAuditLog;