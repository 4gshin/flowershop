// Belirli endpoint'lere gelen istekleri sinirlar - brute force saldirilarina karsi
const rateLimit = require('express-rate-limit');

// Giris/kayit gibi hassas endpoint'ler icin: 15 dakikada IP basina 20 istek
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { mesaj: 'Çok fazla istek gönderdiniz, lütfen bir süre sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Genel API icin: 1 dakikada IP basina 100 istek
const genelLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter, genelLimiter };