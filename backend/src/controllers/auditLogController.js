const prisma = require('../config/db'); // Sənin Prisma client faylın

// Prisma ilə Audit logları gətirən controller (Pagination & Search)
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, action, islem } = req.query;
    const islemFilter = action || islem;

    // Dinamik Prisma where obyekti
    let where = {};

    if (islemFilter) {
      where.islem = islemFilter;
    }

    if (search) {
      where.OR = [
        { islem: { contains: search, mode: 'insensitive' } },
        { kullaniciEmail: { contains: search, mode: 'insensitive' } },
        { hedefTur: { contains: search, mode: 'insensitive' } },
        { detay: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Prisma sorğuları
    const [totalLogs, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { olusturmaTarihi: 'desc' },
        skip: skip,
        take: limit
      })
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      logs: logs, // Frontend hər iki açarı rahatlıqla oxuya bilsin deyə
      pagination: {
        totalLogs,
        currentPage: page,
        totalPages: Math.ceil(totalLogs / limit),
        limit
      }
    });
  } catch (error) {
    console.error('AuditLog Fetch Error:', error);
    res.status(500).json({
      success: false,
      message: 'Audit logları getirilirken bir hata oluştu',
      error: error.message
    });
  }
};