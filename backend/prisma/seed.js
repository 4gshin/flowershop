// Baslangic verilerini veritabanina eklemek icin seed script
// Calistirmak icin: node prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Kategoriler
  const kategoriler = await Promise.all([
    prisma.kategori.upsert({ where: { ad: 'Lale' }, update: {}, create: { ad: 'Lale', aciklama: 'Lale Koleksiyonu' } }),
    prisma.kategori.upsert({ where: { ad: 'Lilyum' }, update: {}, create: { ad: 'Lilyum', aciklama: 'Lilyum / Kazablanka Koleksiyonu' } }),
    prisma.kategori.upsert({ where: { ad: 'Orkide' }, update: {}, create: { ad: 'Orkide', aciklama: 'Orkide Çeşitleri' } }),
    prisma.kategori.upsert({ where: { ad: 'Gül' }, update: {}, create: { ad: 'Gül', aciklama: 'Gül Çeşitleri' } }),
    prisma.kategori.upsert({ where: { ad: 'Özel Günler' }, update: {}, create: { ad: 'Özel Günler', aciklama: 'Doğum günü, yıldönümü ve özel tedbirler için' } })
  ]);

  // Teslimat bolgeleri (Ankara ilceleri)
  const bolgeler = [
    { bolgeAdi: 'Çankaya', teslimatUcreti: 5 },
    { bolgeAdi: 'Keçiören', teslimatUcreti: 6 },
    { bolgeAdi: 'Yenimahalle', teslimatUcreti: 6 },
    { bolgeAdi: 'Mamak', teslimatUcreti: 7 },
    { bolgeAdi: 'Etimesgut', teslimatUcreti: 8 },
    { bolgeAdi: 'Sincan', teslimatUcreti: 9 },
    { bolgeAdi: 'Altındağ', teslimatUcreti: 7 },
    { bolgeAdi: 'Gölbaşı', teslimatUcreti: 10 }
  ];

  for (const bolge of bolgeler) {
    await prisma.teslimatBolgesi.upsert({
      where: { bolgeAdi: bolge.bolgeAdi },
      update: {},
      create: bolge
    });
  }

  // Ornek admin kullanicisi
  const adminSifreHash = await bcrypt.hash('admin123', 10);
  await prisma.kullanici.upsert({
    where: { email: 'admin@flowershop.com' },
    update: {},
    create: {
      adSoyad: 'Yönetici Hesabı',
      email: 'admin@flowershop.com',
      sifreHash: adminSifreHash,
      rol: 'ADMIN'
    }
  });

  // Ornek urunler
  await prisma.urun.createMany({
    data: [
      { ad: 'Kırmızı Lale Buketi', aciklama: 'Taze kırmızı lalelerden oluşan buket', fiyat: 15, stokAdedi: 20, kategoriId: kategoriler[0].id },
      { ad: 'Beyaz Kazablanka', aciklama: 'Beyaz lilyum/kazablanka aranjmanı', fiyat: 25, stokAdedi: 15, kategoriId: kategoriler[1].id },
      { ad: 'Pembe Orkide', aciklama: 'Saksıda pembe orkide', fiyat: 35, stokAdedi: 10, kategoriId: kategoriler[2].id },
      { ad: 'Kırmızı Gül Buketi (11 adet)', aciklama: 'Klasik kırmızı gül buketi', fiyat: 20, stokAdedi: 25, kategoriId: kategoriler[3].id },
      { ad: 'Doğum Günü Özel Aranjmanı', aciklama: 'Karışık çiçek ve balon ile özel aranjman', fiyat: 40, stokAdedi: 8, kategoriId: kategoriler[4].id }
    ]
  });

  console.log('Başlangıç verileri başarıyla eklendi.');
  console.log('Örnek admin girişi -> email: admin@flowershop.com | şifre: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });