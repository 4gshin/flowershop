// Kayit olma ve giris yapma islemlerini yoneten controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

async function kayitOl(req, res) {
  try {
    const { adSoyad, email, sifre, telefon, adres } = req.body;

    if (!adSoyad || !email || !sifre) {
      return res.status(400).json({ mesaj: 'Ad soyad, email ve sifre zorunludur.' });
    }

    const mevcutKullanici = await prisma.kullanici.findUnique({ where: { email } });
    if (mevcutKullanici) {
      return res.status(409).json({ mesaj: 'Bu email adresi ile kayitli bir kullanici zaten var.' });
    }

    const sifreHash = await bcrypt.hash(sifre, 10);

    const yeniKullanici = await prisma.kullanici.create({
      data: { adSoyad, email, sifreHash, telefon, adres }
    });

    return res.status(201).json({
      mesaj: 'Kayit basariyla olusturuldu.',
      kullanici: { id: yeniKullanici.id, adSoyad: yeniKullanici.adSoyad, email: yeniKullanici.email }
    });
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Kayit sirasinda bir hata olustu.' });
  }
}

async function girisYap(req, res) {
  try {
    const { email, sifre } = req.body;

    const kullanici = await prisma.kullanici.findUnique({ where: { email } });
    if (!kullanici) {
      return res.status(401).json({ mesaj: 'Email veya sifre hatali.' });
    }

    const sifreDogruMu = await bcrypt.compare(sifre, kullanici.sifreHash);
    if (!sifreDogruMu) {
      return res.status(401).json({ mesaj: 'Email veya sifre hatali.' });
    }

    const token = jwt.sign(
      { id: kullanici.id, rol: kullanici.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      mesaj: 'Giris basarili.',
      token,
      kullanici: { id: kullanici.id, adSoyad: kullanici.adSoyad, email: kullanici.email, rol: kullanici.rol }
    });
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Giris sirasinda bir hata olustu.' });
  }
}

module.exports = { kayitOl, girisYap };