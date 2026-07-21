// Teslimat bolgeleri ve ucretleri ile ilgili islemleri yoneten controller
const prisma = require('../config/db');

async function bolgeleriListele(req, res) {
  try {
    const bolgeler = await prisma.teslimatBolgesi.findMany({
      orderBy: { bolgeAdi: 'asc' }
    });
    return res.status(200).json(bolgeler);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Teslimat bolgeleri listelenirken bir hata olustu.' });
  }
}

async function bolgeEkle(req, res) {
  try {
    const { bolgeAdi, teslimatUcreti } = req.body;
    if (!bolgeAdi || teslimatUcreti === undefined) {
      return res.status(400).json({ mesaj: 'Bolge adi ve teslimat ucreti zorunludur.' });
    }
    const yeniBolge = await prisma.teslimatBolgesi.create({
      data: { bolgeAdi, teslimatUcreti: Number(teslimatUcreti) }
    });
    return res.status(201).json(yeniBolge);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Bolge eklenirken bir hata olustu.' });
  }
}

async function bolgeGuncelle(req, res) {
  try {
    const { id } = req.params;
    const { teslimatUcreti, bolgeAdi } = req.body;
    const guncellenenBolge = await prisma.teslimatBolgesi.update({
      where: { id: Number(id) },
      data: { teslimatUcreti: teslimatUcreti !== undefined ? Number(teslimatUcreti) : undefined, bolgeAdi }
    });
    return res.status(200).json(guncellenenBolge);
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Bolge guncellenirken bir hata olustu.' });
  }
}

async function bolgeSil(req, res) {
  try {
    const { id } = req.params;
    await prisma.teslimatBolgesi.delete({ where: { id: Number(id) } });
    return res.status(200).json({ mesaj: 'Bolge silindi.' });
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Bolge silinirken bir hata olustu.' });
  }
}

module.exports = { bolgeleriListele, bolgeEkle, bolgeGuncelle, bolgeSil };