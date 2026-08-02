// Sistemdeki onemli islemleri kaydetmek icin ortak yardimci fonksiyon
// Kullanimi: await kaydet(req.kullanici, 'URUN_SILINDI', 'Urun', urunId, { ad: urun.ad })
const prisma = require('../config/db');

async function kaydet(kullanici, islem, hedefTur = null, hedefId = null, detayObjesi = null) {
  try {
    await prisma.auditLog.create({
      data: {
        kullaniciId: kullanici?.id || null,
        kullaniciEmail: kullanici?.email || null,
        islem,
        hedefTur,
        hedefId,
        detay: detayObjesi ? JSON.stringify(detayObjesi) : null
      }
    });
  } catch (hata) {
    // Audit log yazilamasa bile asil islem durmamali, sadece konsola yazip devam ediyoruz
    console.error('Audit log yazilirken hata olustu:', hata);
  }
}

module.exports = { kaydet };
