// Siparis olusturma ve siparis yonetimi ile ilgili controller
const prisma = require('../config/db');
const { kaydet } = require('../utils/auditLog');

async function siparisOlustur(req, res) {
  try {
    const kullaniciId = req.kullanici.id;
    const { urunler, teslimatBolgesiId, teslimatAdresi, aliciAdSoyad, aliciTelefon, not } = req.body;

    if (!urunler || urunler.length === 0) {
      return res.status(400).json({ mesaj: 'Sepetiniz bos, siparis olusturulamaz.' });
    }
    if (!teslimatBolgesiId || !teslimatAdresi || !aliciAdSoyad || !aliciTelefon) {
      return res.status(400).json({ mesaj: 'Teslimat bilgileri eksik.' });
    }

    const teslimatBolgesi = await prisma.teslimatBolgesi.findUnique({
      where: { id: Number(teslimatBolgesiId) }
    });
    if (!teslimatBolgesi) {
      return res.status(404).json({ mesaj: 'Secilen teslimat bolgesi bulunamadi.' });
    }

    const sonuc = await prisma.$transaction(async (tx) => {
      let urunToplami = 0;
      const kalemVerileri = [];

      for (const kalem of urunler) {
        const urun = await tx.urun.findUnique({ where: { id: Number(kalem.urunId) } });
        if (!urun) {
          throw new Error(`STOK_HATASI:Urun bulunamadi (id: ${kalem.urunId}).`);
        }

        const guncelleme = await tx.urun.updateMany({
          where: {
            id: urun.id,
            stokAdedi: { gte: kalem.adet }
          },
          data: {
            stokAdedi: { decrement: kalem.adet }
          }
        });

        if (guncelleme.count === 0) {
          throw new Error(`STOK_HATASI:"${urun.ad}" urunu icin yeterli stok bulunmuyor.`);
        }

        const birimFiyat = Number(urun.fiyat);
        urunToplami += birimFiyat * kalem.adet;
        kalemVerileri.push({ urunId: urun.id, adet: kalem.adet, birimFiyat });
      }

      const teslimatUcreti = Number(teslimatBolgesi.teslimatUcreti);
      const genelToplam = urunToplami + teslimatUcreti;

      const yeniSiparis = await tx.siparis.create({
        data: {
          kullaniciId,
          teslimatBolgesiId: teslimatBolgesi.id,
          teslimatAdresi,
          aliciAdSoyad,
          aliciTelefon,
          urunToplami,
          teslimatUcreti,
          genelToplam,
          not,
          kalemler: { create: kalemVerileri }
        },
        include: { kalemler: true, teslimatBolgesi: true }
      });

      return yeniSiparis;
    });

    await kaydet(req.kullanici, 'SIPARIS_OLUSTURULDU', 'Siparis', sonuc.id, { genelToplam: sonuc.genelToplam });

    return res.status(201).json({
      mesaj: 'Siparisiniz alindi, en kisa surede sizinle iletisime gecilecektir.',
      siparis: sonuc
    });
  } catch (hata) {
    console.error(hata);

    if (hata.message && hata.message.startsWith('STOK_HATASI:')) {
      return res.status(409).json({ mesaj: hata.message.replace('STOK_HATASI:', '') });
    }

    return res.status(500).json({ mesaj: 'Siparis olusturulurken bir hata olustu.' });
  }
}

async function kendiSiparislerimGetir(req, res) {
  try {
    const siparisler = await prisma.siparis.findMany({
      where: { kullaniciId: req.kullanici.id },
      include: { kalemler: { include: { urun: true } }, teslimatBolgesi: true },
      orderBy: { olusturmaTarihi: 'desc' }
    });
    return res.status(200).json(siparisler);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Siparisler listelenirken bir hata olustu.' });
  }
}

async function tumSiparisleriListele(req, res) {
  try {
    const siparisler = await prisma.siparis.findMany({
      include: { kullanici: true, kalemler: { include: { urun: true } }, teslimatBolgesi: true },
      orderBy: { olusturmaTarihi: 'desc' }
    });
    return res.status(200).json(siparisler);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Siparisler listelenirken bir hata olustu.' });
  }
}

async function siparisDurumGuncelle(req, res) {
  try {
    const { id } = req.params;
    const { durum } = req.body;

    const guncellenenSiparis = await prisma.siparis.update({
      where: { id: Number(id) },
      data: { durum }
    });

    await kaydet(req.kullanici, 'SIPARIS_DURUMU_GUNCELLENDI', 'Siparis', guncellenenSiparis.id, { yeniDurum: durum });

    return res.status(200).json(guncellenenSiparis);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Siparis durumu guncellenirken bir hata olustu.' });
  }
}

module.exports = {
  siparisOlustur,
  kendiSiparislerimGetir,
  tumSiparisleriListele,
  siparisDurumGuncelle
};
