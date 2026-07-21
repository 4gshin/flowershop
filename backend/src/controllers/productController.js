// Urunlerle ilgili islemleri yoneten controller
const prisma = require('../config/db');

async function urunleriListele(req, res) {
  try {
    const { kategoriId } = req.query;
    const filtre = { aktif: true };
    if (kategoriId) filtre.kategoriId = Number(kategoriId);

    const urunler = await prisma.urun.findMany({
      where: filtre,
      include: { kategori: true },
      orderBy: { olusturmaTarihi: 'desc' }
    });

    return res.status(200).json(urunler);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Urunler listelenirken bir hata olustu.' });
  }
}

async function urunDetayGetir(req, res) {
  try {
    const { id } = req.params;
    const urun = await prisma.urun.findUnique({
      where: { id: Number(id) },
      include: { kategori: true }
    });

    if (!urun) return res.status(404).json({ mesaj: 'Urun bulunamadi.' });
    return res.status(200).json(urun);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Urun getirilirken bir hata olustu.' });
  }
}

async function urunEkle(req, res) {
  try {
    const { ad, aciklama, fiyat, stokAdedi, kategoriId } = req.body;

    if (!ad || !fiyat || !kategoriId) {
      return res.status(400).json({ mesaj: 'Urun adi, fiyat ve kategori zorunludur.' });
    }

    const gorselUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const yeniUrun = await prisma.urun.create({
      data: {
        ad,
        aciklama,
        fiyat: Number(fiyat),
        stokAdedi: Number(stokAdedi) || 0,
        kategoriId: Number(kategoriId),
        gorselUrl
      }
    });

    return res.status(201).json(yeniUrun);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Urun eklenirken bir hata olustu.' });
  }
}

async function urunGuncelle(req, res) {
  try {
    const { id } = req.params;
    const guncellenenUrun = await prisma.urun.update({
      where: { id: Number(id) },
      data: req.body
    });
    return res.status(200).json(guncellenenUrun);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Urun guncellenirken bir hata olustu.' });
  }
}

async function urunSil(req, res) {
  try {
    const { id } = req.params;
    await prisma.urun.update({ where: { id: Number(id) }, data: { aktif: false } });
    return res.status(200).json({ mesaj: 'Urun basariyla kaldirildi.' });
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Urun silinirken bir hata olustu.' });
  }
}

module.exports = { urunleriListele, urunDetayGetir, urunEkle, urunGuncelle, urunSil };