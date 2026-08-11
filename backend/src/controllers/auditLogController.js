// Admin panelinde audit log'lari listelemek icin controller
const prisma = require('../config/db');

async function auditLoglariListele(req, res) {
  try {
    const { islem, limit = 100 } = req.query;

    const filtre = {};
    if (islem) filtre.islem = islem;

    const loglar = await prisma.auditLog.findMany({
      where: filtre,
      orderBy: { olusturmaTarihi: 'desc' },
      take: Number(limit)
    });

    return res.status(200).json(loglar);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Audit loglari getirilirken bir hata olustu.' });
  }
}

module.exports = { auditLoglariListele };