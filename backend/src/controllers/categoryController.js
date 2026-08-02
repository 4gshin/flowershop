// Kategorilerle ilgili islemleri yoneten controller
const prisma = require('../config/db');
const { kaydet } = require('../utils/auditLog');

async function kategorileriListele(req, res) {
  try {
    const kategoriler = await prisma.kategori.findMany({
      where: { parentId: null },
      include: { altKategoriler: { orderBy: { ad: 'asc' } } },
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
    const { ad, aciklama, parentId } = req.body;
    if (!ad) {
      return res.status(400).json({ mesaj: 'Kategori adi zorunludur.' });
    }
    const yeniKategori = await prisma.kategori.create({
      data: { ad, aciklama, parentId: parentId ? Number(parentId) : null }
    });

    await kaydet(req.kullanici, 'KATEGORI_OLUSTURULDU', 'Kategori', yeniKategori.id, { ad: yeniKategori.ad });

    return res.status(201).json(yeniKategori);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Kategori eklenirken bir hata olustu.' });
  }
}

async function kategoriSil(req, res) {
  try {
    const { id } = req.params;
    const kategori = await prisma.kategori.delete({ where: { id: Number(id) } });

    await kaydet(req.kullanici, 'KATEGORI_SILINDI', 'Kategori', kategori.id, { ad: kategori.ad });

    return res.status(200).json({ mesaj: 'Kategori silindi.' });
  } catch (hata) {
    const mesajMetni = hata.message || '';
    const iliskiliVeriVar =
      hata.code === 'P2003' ||
      mesajMetni.includes('foreign key') ||
      mesajMetni.includes('violates') ||
      mesajMetni.includes('RESTRICT');

    if (iliskiliVeriVar) {
      return res.status(409).json({
        mesaj: 'Bu kategoriye ait ürünler veya alt kategoriler var. Önce bunları başka bir kategoriye taşıyın veya silin, ardından kategoriyi kaldırabilirsiniz.'
      });
    }

    console.error(hata);
    return res.status(500).json({ mesaj: 'Kategori silinirken bir hata olustu.' });
  }
}

module.exports = { kategorileriListele, kategoriEkle, kategoriSil };
