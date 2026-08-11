// Admin dashboard icin istatistik verilerini hesaplayan controller
const prisma = require('../config/db');

async function istatistikleriGetir(req, res) {
  try {
    // Su anki ayin baslangici
    const simdi = new Date();
    const buAyBaslangic = new Date(simdi.getFullYear(), simdi.getMonth(), 1);
    const oncekiAyBaslangic = new Date(simdi.getFullYear(), simdi.getMonth() - 1, 1);
    const oncekiAySonu = new Date(simdi.getFullYear(), simdi.getMonth(), 0);

    // Paralel olarak tum verileri cek
    const [
      toplamUrun,
      toplamKullanici,
      toplamSiparis,
      buAyStatistik,
      oncekiAyStatistik,
      durumSayilari,
      enCokSatilanlar,
      sonSiparisler
    ] = await Promise.all([
      prisma.urun.count({ where: { aktif: true } }),
      prisma.kullanici.count({ where: { rol: 'KULLANICI' } }),
      prisma.siparis.count(),
      prisma.siparis.aggregate({
        where: { olusturmaTarihi: { gte: buAyBaslangic } },
        _sum: { genelToplam: true },
        _count: true
      }),
      prisma.siparis.aggregate({
        where: {
          olusturmaTarihi: { gte: oncekiAyBaslangic, lte: oncekiAySonu }
        },
        _sum: { genelToplam: true },
        _count: true
      }),
      prisma.siparis.groupBy({
        by: ['durum'],
        _count: true
      }),
      prisma.siparisKalemi.groupBy({
        by: ['urunId'],
        _sum: { adet: true },
        orderBy: { _sum: { adet: 'desc' } },
        take: 5
      }),
      prisma.siparis.findMany({
        take: 5,
        orderBy: { olusturmaTarihi: 'desc' },
        include: { kullanici: { select: { adSoyad: true, email: true } } }
      })
    ]);

    // En cok satilanlarin urun bilgilerini cek
    const enCokUrunIdler = enCokSatilanlar.map((e) => e.urunId);
    const enCokUrunler = await prisma.urun.findMany({
      where: { id: { in: enCokUrunIdler } },
      select: { id: true, ad: true, fiyat: true, gorselUrl: true }
    });

    const enCokSatilanZengin = enCokSatilanlar.map((s) => {
      const urun = enCokUrunler.find((u) => u.id === s.urunId);
      return {
        id: s.urunId,
        ad: urun?.ad || 'Silinmis urun',
        fiyat: urun?.fiyat || 0,
        gorselUrl: urun?.gorselUrl || null,
        satisAdedi: s._sum.adet || 0
      };
    });

    // Toplam gelir (butun zamanlar)
    const toplamGelirData = await prisma.siparis.aggregate({
      _sum: { genelToplam: true }
    });

    return res.status(200).json({
      genelSayilar: {
        toplamUrun,
        toplamKullanici,
        toplamSiparis,
        toplamGelir: Number(toplamGelirData._sum.genelToplam || 0)
      },
      buAy: {
        siparisSayisi: buAyStatistik._count || 0,
        gelir: Number(buAyStatistik._sum.genelToplam || 0)
      },
      oncekiAy: {
        siparisSayisi: oncekiAyStatistik._count || 0,
        gelir: Number(oncekiAyStatistik._sum.genelToplam || 0)
      },
      durumSayilari: durumSayilari.map((d) => ({ durum: d.durum, sayi: d._count })),
      enCokSatilanlar: enCokSatilanZengin,
      sonSiparisler: sonSiparisler.map((s) => ({
        id: s.id,
        aliciAdSoyad: s.aliciAdSoyad,
        kullaniciAdSoyad: s.kullanici?.adSoyad,
        kullaniciEmail: s.kullanici?.email,
        durum: s.durum,
        genelToplam: Number(s.genelToplam),
        olusturmaTarihi: s.olusturmaTarihi
      }))
    });
  } catch (hata) {
    console.error(hata);
    return res.status(500).json({ mesaj: 'Istatistikler getirilirken bir hata olustu.' });
  }
}

module.exports = { istatistikleriGetir };