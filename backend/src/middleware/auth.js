// Kullanicinin giris yapip yapmadigini kontrol eden middleware
const jwt = require('jsonwebtoken');

function girisKontrolu(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mesaj: 'Giris yapmaniz gerekiyor.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.kullanici = payload;
    next();
  } catch (hata) {
    return res.status(401).json({ mesaj: 'Oturum gecersiz veya suresi dolmus.' });
  }
}

module.exports = girisKontrolu;