// Kategorilerle ilgili islemleri yoneten controller
const prisma = require('../config/db');

async function kategorileriListele(req, res) {
  try {
    const kategoriler = await prisma.kategori.findMany({
      orderBy: { ad: 'asc' }
    });
    return res.status(200).json(kategoriler);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Kategoriler listelenirken bir hata olustu.' });
  }
}

async function kategoriEkle(req, res) {
  try {
    const { ad, aciklama } = req.body;
    if (!ad) {
      return res.status(400).json({ mesaj: 'Kategori adi zorunludur.' });
    }
    const yeniKategori = await prisma.kategori.create({ data: { ad, aciklama } });
    return res.status(201).json(yeniKategori);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Kategori eklenirken bir hata olustu.' });
  }
}

async function kategoriSil(req, res) {
  try {
    const { id } = req.params;
    await prisma.kategori.delete({ where: { id: Number(id) } });
    return res.status(200).json({ mesaj: 'Kategori silindi.' });
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Kategori silinirken bir hata olustu.' });
  }
}

module.exports = { kategorileriListele, kategoriEkle, kategoriSil };