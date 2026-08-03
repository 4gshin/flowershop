// Urunlerle ilgili islemleri yoneten controller
const prisma = require('../config/db');
const { kaydet } = require('../utils/auditLog');

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

    // Cloudinary kullanildiginda req.file.path zaten tam URL'dir (https://res.cloudinary.com/...)
    const gorselUrl = req.file ? req.file.path : null;

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

    await kaydet(req.kullanici, 'URUN_OLUSTURULDU', 'Urun', yeniUrun.id, { ad: yeniUrun.ad, fiyat: yeniUrun.fiyat });

    return res.status(201).json(yeniUrun);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Urun eklenirken bir hata olustu.' });
  }
}

async function urunGuncelle(req, res) {
  try {
    const { id } = req.params;
    const { ad, aciklama, fiyat, stokAdedi, kategoriId } = req.body;

    const guncellenecekVeri = {};
    if (ad !== undefined) guncellenecekVeri.ad = ad;
    if (aciklama !== undefined) guncellenecekVeri.aciklama = aciklama;
    if (fiyat !== undefined) guncellenecekVeri.fiyat = Number(fiyat);
    if (stokAdedi !== undefined) guncellenecekVeri.stokAdedi = Number(stokAdedi);
    if (kategoriId !== undefined) guncellenecekVeri.kategoriId = Number(kategoriId);

    if (req.file) {
      guncellenecekVeri.gorselUrl = req.file.path;
    }

    const guncellenenUrun = await prisma.urun.update({
      where: { id: Number(id) },
      data: guncellenecekVeri
    });

    await kaydet(req.kullanici, 'URUN_GUNCELLENDI', 'Urun', guncellenenUrun.id, guncellenecekVeri);

    return res.status(200).json(guncellenenUrun);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Urun guncellenirken bir hata olustu.' });
  }
}

async function urunSil(req, res) {
  try {
    const { id } = req.params;
    const urun = await prisma.urun.update({ where: { id: Number(id) }, data: { aktif: false } });

    await kaydet(req.kullanici, 'URUN_SILINDI', 'Urun', urun.id, { ad: urun.ad });

    return res.status(200).json({ mesaj: 'Urun basariyla kaldirildi.' });
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Urun silinirken bir hata olustu.' });
  }
}

module.exports = { urunleriListele, urunDetayGetir, urunEkle, urunGuncelle, urunSil };