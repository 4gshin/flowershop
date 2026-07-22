// Siparis olusturma ve siparis yonetimi ile ilgili controller
const prisma = require('../config/db');

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

    let urunToplami = 0;
    const kalemVerileri = [];

    for (const kalem of urunler) {
      const urun = await prisma.urun.findUnique({ where: { id: Number(kalem.urunId) } });
      if (!urun) {
        return res.status(404).json({ mesaj: `Urun bulunamadi (id: ${kalem.urunId}).` });
      }
      const birimFiyat = Number(urun.fiyat);
      urunToplami += birimFiyat * kalem.adet;
      kalemVerileri.push({ urunId: urun.id, adet: kalem.adet, birimFiyat });
    }

    const teslimatUcreti = Number(teslimatBolgesi.teslimatUcreti);
    const genelToplam = urunToplami + teslimatUcreti;

    const yeniSiparis = await prisma.siparis.create({
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

    return res.status(201).json({
      mesaj: 'Siparisiniz alindi, en kisa surede sizinle iletisime gecilecektir.',
      siparis: yeniSiparis
    });
  } catch (hata) {
    console.error(hata);
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
    return res.status(200).json(guncellenenSiparis);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Siparis durumu guncellenirken bir hata olustu.' });
  }
}

module.exports = { siparisOlustur, kendiSiparislerimGetir, tumSiparisleriListele, siparisDurumGuncelle };