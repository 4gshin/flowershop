const AuditLog = require('../models/AuditLog'); // DB modelinizə uyğun tənzimləyin

// Audit logları gətirən controller (Pagination, Filtering, Search ilə)
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, action, level } = req.query;

    // Dinamik filter obyekti
    let query = {};

    if (action) {
      query.action = action;
    }

    if (level) {
      query.level = level;
    }

    if (search) {
      query.$or = [
        { details: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const totalLogs = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        totalLogs,
        currentPage: page,
        totalPages: Math.ceil(totalLogs / limit),
        limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Audit logları gətirilərkən xəta baş verdi',
      error: error.message
    });
  }
};