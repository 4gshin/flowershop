// routes/yorumRoutes.js - Sadece bu urunu satin almis kullanicilar yorum yapabilir
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const girisKontrolu = require('../middleware/auth');
const prisma = new PrismaClient();

// 1. Bir mehsula aid butun yorumlari ve orta yildiz puanini getir (PUBLIC)
router.get('/urun/:urunId', async (req, res) => {
  try {
    const urunId = parseInt(req.params.urunId);

    const yorumlar = await prisma.yorum.findMany({
      where: { urunId },
      orderBy: { olusturmaTarihi: 'desc' }
    });

    const toplamPuan = yorumlar.reduce((acc, item) => acc + item.puan, 0);
    const ortalamaPuan = yorumlar.length > 0 ? (toplamPuan / yorumlar.length).toFixed(1) : 0;

    res.status(200).json({
      basarili: true,
      ortalamaPuan: Number(ortalamaPuan),
      toplamYorum: yorumlar.length,
      yorumlar
    });
  } catch (err) {
    console.error('Yorumlar alinirken hata:', err);
    res.status(500).json({ mesaj: 'Yorumlar yuklenirken sunucu hatasi olustu.' });
  }
});

// 2. Kullanicinin bu urun icin yorum yapip yapamayacagini kontrol eder (frontend'in kullanmasi icin)
router.get('/hakkim-var-mi/:urunId', girisKontrolu, async (req, res) => {
  try {
    const urunId = parseInt(req.params.urunId);

    // Bu kullanici, bu urunu iceren TESLIM_EDILDI durumunda bir siparise sahip mi?
    const alinmisMi = await prisma.siparis.findFirst({
      where: {
        kullaniciId: req.kullanici.id,
        durum: 'TESLIM_EDILDI',
        kalemler: { some: { urunId } }
      }
    });

    // Daha once bu urun icin yorum yapmis mi?
    const mevcutYorum = await prisma.yorum.findFirst({
      where: { urunId, kullaniciId: req.kullanici.id }
    });

    res.status(200).json({
      yorumYapabilir: !!alinmisMi && !mevcutYorum,
      sebep: !alinmisMi
        ? 'satin_almadi'
        : mevcutYorum
          ? 'zaten_yorum_yapti'
          : null
    });
  } catch (err) {
    console.error('Yorum hakki kontrolunde hata:', err);
    res.status(500).json({ mesaj: 'Kontrol sirasinda bir hata olustu.' });
  }
});

// 3. Yeni yorum ve puan ekle (SADECE URUNU ALMIS OLANLAR)
router.post('/', girisKontrolu, async (req, res) => {
  try {
    const { urunId, puan, yorum } = req.body;

    if (!urunId || !puan) {
      return res.status(400).json({ mesaj: 'Lutfen puan ve urun bilgisi girin.' });
    }

    if (puan < 1 || puan > 5) {
      return res.status(400).json({ mesaj: 'Puan 1 ile 5 arasinda olmalidir.' });
    }

    // KORUMA 1: Bu urunu almis ve teslim almis olmali
    const alinmisMi = await prisma.siparis.findFirst({
      where: {
        kullaniciId: req.kullanici.id,
        durum: 'TESLIM_EDILDI',
        kalemler: { some: { urunId: Number(urunId) } }
      }
    });

    if (!alinmisMi) {
      return res.status(403).json({
        mesaj: 'Yorum yapabilmek icin bu urunu satin almis ve teslim almis olmaniz gerekir.'
      });
    }

    // KORUMA 2: Ayni urun icin ikinci yorum engellensin
    const mevcutYorum = await prisma.yorum.findFirst({
      where: { urunId: Number(urunId), kullaniciId: req.kullanici.id }
    });

    if (mevcutYorum) {
      return res.status(409).json({ mesaj: 'Bu urun icin zaten bir yorum yaptiniz.' });
    }

    // Yorum icin gorunecek isim - kullanicinin kayitli adi
    const kullanici = await prisma.kullanici.findUnique({
      where: { id: req.kullanici.id },
      select: { adSoyad: true }
    });

    const yeniYorum = await prisma.yorum.create({
      data: {
        urunId: Number(urunId),
        kullaniciId: req.kullanici.id,
        kullaniciAd: kullanici.adSoyad,
        puan: Number(puan),
        yorum: yorum || ''
      }
    });

    res.status(201).json({ basarili: true, yorum: yeniYorum });
  } catch (err) {
    console.error('Yorum eklenirken hata:', err);
    res.status(500).json({ mesaj: 'Yorum eklenemedi, lutfen tekrar deneyin.' });
  }
});

module.exports = router;