// Sadece admin rolune sahip kullanicilarin erisebilecegi rotalar icin kontrol
function adminKontrolu(req, res, next) {
  if (!req.kullanici || req.kullanici.rol !== 'ADMIN') {
    return res.status(403).json({ mesaj: 'Bu işlem için yetkiniz bulunmuyor.' });
  }
  next();
}

module.exports = adminKontrolu;