// Urunlerle ilgili islemleri yoneten controller
const prisma = require('../config/db');
const { kaydet } = require('../utils/auditLog');

// Yardimci: bir urunun yorumlarindan ortalama puani ve toplam yorum sayisini hesaplar
function reytingHesapla(yorumlar) {
  if (!yorumlar || yorumlar.length === 0) {
    return { ortalamaPuan: 0, toplamYorum: 0 };
  }
  const toplam = yorumlar.reduce((acc, y) => acc + y.puan, 0);
  return {
    ortalamaPuan: Number((toplam / yorumlar.length).toFixed(1)),
    toplamYorum: yorumlar.length
  };
}

async function urunleriListele(req, res) {
  try {
    const { kategoriId } = req.query;
    const filtre = { aktif: true };
    if (kategoriId) filtre.kategoriId = Number(kategoriId);

    const urunler = await prisma.urun.findMany({
      where: filtre,
      include: {
        kategori: true,
        yorumlar: { select: { puan: true } }
      },
      orderBy: { olusturmaTarihi: 'desc' }
    });

    const zenginlestirilmis = urunler.map((urun) => {
      const { ortalamaPuan, toplamYorum } = reytingHesapla(urun.yorumlar);
      const { yorumlar, ...temiz } = urun;
      return { ...temiz, ortalamaPuan, toplamYorum };
    });

    return res.status(200).json(zenginlestirilmis);
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
      include: {
        kategori: true,
        yorumlar: { select: { puan: true } }
      }
    });

    if (!urun) return res.status(404).json({ mesaj: 'Urun bulunamadi.' });

    const { ortalamaPuan, toplamYorum } = reytingHesapla(urun.yorumlar);
    const { yorumlar, ...temiz } = urun;
    return res.status(200).json({ ...temiz, ortalamaPuan, toplamYorum });
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Urun getirilirken bir hata olustu.' });
  }
}

// En cok satilan urunleri getirir - siparislerdeki toplam adet uzerinden hesaplanir
async function enCokSatilanlar(req, res) {
  try {
    const limit = Number(req.query.limit) || 4;

    const satisSayilari = await prisma.siparisKalemi.groupBy({
      by: ['urunId'],
      _sum: { adet: true },
      orderBy: { _sum: { adet: 'desc' } },
      take: limit
    });

    if (satisSayilari.length === 0) {
      // Hic satis yoksa, en yeni urunleri getir
      const urunler = await prisma.urun.findMany({
        where: { aktif: true },
        include: {
          kategori: true,
          yorumlar: { select: { puan: true } }
        },
        orderBy: { olusturmaTarihi: 'desc' },
        take: limit
      });
      return res.status(200).json(
        urunler.map((u) => {
          const { ortalamaPuan, toplamYorum } = reytingHesapla(u.yorumlar);
          const { yorumlar, ...temiz } = u;
          return { ...temiz, ortalamaPuan, toplamYorum, satisAdedi: 0 };
        })
      );
    }

    const urunIdListesi = satisSayilari.map((s) => s.urunId);
    const urunler = await prisma.urun.findMany({
      where: { id: { in: urunIdListesi }, aktif: true },
      include: {
        kategori: true,
        yorumlar: { select: { puan: true } }
      }
    });

    // Satis sirasina gore duzenle
    const sonuc = satisSayilari
      .map((satis) => {
        const urun = urunler.find((u) => u.id === satis.urunId);
        if (!urun) return null;
        const { ortalamaPuan, toplamYorum } = reytingHesapla(urun.yorumlar);
        const { yorumlar, ...temiz } = urun;
        return {
          ...temiz,
          ortalamaPuan,
          toplamYorum,
          satisAdedi: satis._sum.adet || 0
        };
      })
      .filter((u) => u !== null);

    return res.status(200).json(sonuc);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'En cok satilanlar getirilirken bir hata olustu.' });
  }
}

async function urunEkle(req, res) {
  try {
    const { ad, aciklama, fiyat, stokAdedi, kategoriId } = req.body;

    if (!ad || !fiyat || !kategoriId) {
      return res.status(400).json({ mesaj: 'Urun adi, fiyat ve kategori zorunludur.' });
    }

    // Cloudinary kullaniliyorsa req.file.path zaten tam URL'dir
    const gorselUrl = req.file ? (req.file.path || `/uploads/${req.file.filename}`) : null;

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
      guncellenecekVeri.gorselUrl = req.file.path || `/uploads/${req.file.filename}`;
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

module.exports = { urunleriListele, urunDetayGetir, urunEkle, urunGuncelle, urunSil, enCokSatilanlar };