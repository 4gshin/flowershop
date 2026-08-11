// Kupon yonetimi ve dogrulama islemleri
const prisma = require('../config/db');
const { kaydet } = require('../utils/auditLog');

// Admin: tum kuponlari listele
async function kuponlariListele(req, res) {
  try {
    const kuponlar = await prisma.kupon.findMany({
      orderBy: { olusturmaTarihi: 'desc' }
    });
    return res.status(200).json(kuponlar);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Kuponlar listelenirken bir hata olustu.' });
  }
}

// Admin: yeni kupon ekle
async function kuponEkle(req, res) {
  try {
    const {
      kod, aciklama, endirimTuru, endirimDeger,
      minSiparisTutari, kullanimLimiti, gecerlilikTarihi
    } = req.body;

    if (!kod || !endirimTuru || !endirimDeger) {
      return res.status(400).json({ mesaj: 'Kod, endirim turu ve deger zorunludur.' });
    }

    if (!['YUZDE', 'SABIT'].includes(endirimTuru)) {
      return res.status(400).json({ mesaj: 'Endirim turu YUZDE veya SABIT olmalidir.' });
    }

    if (endirimTuru === 'YUZDE' && (endirimDeger < 1 || endirimDeger > 100)) {
      return res.status(400).json({ mesaj: 'Yuzde endirim 1-100 arasi olmalidir.' });
    }

    const kod_ust = kod.toUpperCase().trim();
    const mevcut = await prisma.kupon.findUnique({ where: { kod: kod_ust } });
    if (mevcut) {
      return res.status(409).json({ mesaj: 'Bu kod ile kupon zaten var.' });
    }

    const yeniKupon = await prisma.kupon.create({
      data: {
        kod: kod_ust,
        aciklama: aciklama || null,
        endirimTuru,
        endirimDeger: Number(endirimDeger),
        minSiparisTutari: minSiparisTutari ? Number(minSiparisTutari) : null,
        kullanimLimiti: kullanimLimiti ? Number(kullanimLimiti) : null,
        gecerlilikTarihi: gecerlilikTarihi ? new Date(gecerlilikTarihi) : null
      }
    });

    await kaydet(req.kullanici, 'KUPON_OLUSTURULDU', 'Kupon', yeniKupon.id, { kod: yeniKupon.kod });

    return res.status(201).json(yeniKupon);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Kupon eklenirken bir hata olustu.' });
  }
}

// Admin: kupon aktifligini degistir (aktif <-> pasif)
async function kuponDurumDegistir(req, res) {
  try {
    const { id } = req.params;
    const kupon = await prisma.kupon.findUnique({ where: { id: Number(id) } });
    if (!kupon) return res.status(404).json({ mesaj: 'Kupon bulunamadi.' });

    const guncel = await prisma.kupon.update({
      where: { id: Number(id) },
      data: { aktif: !kupon.aktif }
    });

    await kaydet(
      req.kullanici,
      guncel.aktif ? 'KUPON_AKTIFLESTIRILDI' : 'KUPON_PASIFLESTIRILDI',
      'Kupon', guncel.id, { kod: guncel.kod }
    );

    return res.status(200).json(guncel);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Kupon durumu degistirilirken bir hata olustu.' });
  }
}

// Admin: kupon sil
async function kuponSil(req, res) {
  try {
    const { id } = req.params;

    // Kullanilmis bir kupon silinemez
    const kupon = await prisma.kupon.findUnique({ where: { id: Number(id) } });
    if (!kupon) return res.status(404).json({ mesaj: 'Kupon bulunamadi.' });

    if (kupon.kullanimSayisi > 0) {
      return res.status(409).json({
        mesaj: 'Bu kupon en az bir siparise uygulanmis, silinemez. Bunun yerine pasiflestirebilirsiniz.'
      });
    }

    await prisma.kupon.delete({ where: { id: Number(id) } });
    await kaydet(req.kullanici, 'KUPON_SILINDI', 'Kupon', kupon.id, { kod: kupon.kod });

    return res.status(200).json({ mesaj: 'Kupon silindi.' });
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Kupon silinirken bir hata olustu.' });
  }
}

// Musteri: kupon kodu dogrula (checkout'ta kullanilir)
async function kuponDogrula(req, res) {
  try {
    const { kod, siparisTutari } = req.body;

    if (!kod) {
      return res.status(400).json({ mesaj: 'Kupon kodu gereklidir.' });
    }

    const kupon = await prisma.kupon.findUnique({
      where: { kod: kod.toUpperCase().trim() }
    });

    if (!kupon) {
      return res.status(404).json({ mesaj: 'Gecersiz kupon kodu.' });
    }

    if (!kupon.aktif) {
      return res.status(400).json({ mesaj: 'Bu kupon artik aktif degil.' });
    }

    if (kupon.gecerlilikTarihi && new Date(kupon.gecerlilikTarihi) < new Date()) {
      return res.status(400).json({ mesaj: 'Bu kuponun gecerlilik suresi dolmus.' });
    }

    if (kupon.kullanimLimiti && kupon.kullanimSayisi >= kupon.kullanimLimiti) {
      return res.status(400).json({ mesaj: 'Bu kupon icin kullanim limitine ulasilmis.' });
    }

    const tutar = Number(siparisTutari || 0);
    if (kupon.minSiparisTutari && tutar < Number(kupon.minSiparisTutari)) {
      return res.status(400).json({
        mesaj: `Bu kuponu kullanmak icin en az ${Number(kupon.minSiparisTutari)} TL alisveris yapmalisiniz.`
      });
    }

    // Endirim tutarini hesapla
    let endirimTutari = 0;
    if (kupon.endirimTuru === 'YUZDE') {
      endirimTutari = (tutar * Number(kupon.endirimDeger)) / 100;
    } else {
      endirimTutari = Number(kupon.endirimDeger);
    }

    // Endirim, urun toplamindan buyuk olamaz
    if (endirimTutari > tutar) endirimTutari = tutar;
    endirimTutari = Number(endirimTutari.toFixed(2));

    return res.status(200).json({
      gecerli: true,
      kuponId: kupon.id,
      kod: kupon.kod,
      aciklama: kupon.aciklama,
      endirimTuru: kupon.endirimTuru,
      endirimDeger: Number(kupon.endirimDeger),
      endirimTutari
    });
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Kupon dogrulanirken bir hata olustu.' });
  }
}

module.exports = {
  kuponlariListele,
  kuponEkle,
  kuponDurumDegistir,
  kuponSil,
  kuponDogrula
};