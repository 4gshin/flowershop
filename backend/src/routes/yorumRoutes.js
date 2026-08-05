// routes/yorumRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Bir məhsula aid bütün yorumları və orta ulduz puanını gətir (GET /api/yorumlar/urun/:urunId)
router.get('/urun/:urunId', async (req, res) => {
  try {
    const urunId = parseInt(req.params.urunId);

    const yorumlar = await prisma.yorum.findMany({
      where: { urunId },
      orderBy: { olusturmaTarihi: 'desc' }
    });

    // Ortalama puanı (reytinqi) hesablayaq
    const toplamPuan = yorumlar.reduce((acc, item) => acc + item.puan, 0);
    const ortalamaPuan = yorumlar.length > 0 ? (toplamPuan / yorumlar.length).toFixed(1) : 0;

    res.status(200).json({
      basarili: true,
      ortalamaPuan: Number(ortalamaPuan),
      toplamYorum: yorumlar.length,
      yorumlar
    });
  } catch (err) {
    console.error('Yorumlar alınırken hata:', err);
    res.status(500).json({ mesaj: 'Yorumlar yüklenirken sunucu hatası oluştu.' });
  }
});

// 2. Yeni yorum ve puan ekle (POST /api/yorumlar)
router.post('/', async (req, res) => {
  try {
    const { urunId, puan, yorum, kullaniciAd } = req.body;

    if (!urunId || !puan || !kullaniciAd) {
      return res.status(400).json({ mesaj: 'Lütfen puan ve ad alanlarını doldurun.' });
    }

    const yeniYorum = await prisma.yorum.create({
      data: {
        urunId: Number(urunId),
        puan: Number(puan),
        yorum: yorum || '',
        kullaniciAd
      }
    });

    res.status(201).json({ basarili: true, yorum: yeniYorum });
  } catch (err) {
    console.error('Yorum eklenirken hata:', err);
    res.status(500).json({ mesaj: 'Yorum eklenemedi, lütfen tekrar deneyin.' });
  }
});

module.exports = router;