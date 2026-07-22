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
    prisma.kategori.upsert({ where: { ad: 'Orkide' }, update: {}, create: { ad: 'Orkide', aciklama: 'Orkide Cesitleri' } }),
    prisma.kategori.upsert({ where: { ad: 'Gul' }, update: {}, create: { ad: 'Gul', aciklama: 'Gul Cesitleri' } }),
    prisma.kategori.upsert({ where: { ad: 'Ozel Gunler' }, update: {}, create: { ad: 'Ozel Gunler', aciklama: 'Dogum gunu, yildonumu ve ozel tedbirler icin' } })
  ]);

  // Teslimat bolgeleri (Ankara ilceleri)
  const bolgeler = [
    { bolgeAdi: 'Cankaya', teslimatUcreti: 5 },
    { bolgeAdi: 'Kecioren', teslimatUcreti: 6 },
    { bolgeAdi: 'Yenimahalle', teslimatUcreti: 6 },
    { bolgeAdi: 'Mamak', teslimatUcreti: 7 },
    { bolgeAdi: 'Etimesgut', teslimatUcreti: 8 },
    { bolgeAdi: 'Sincan', teslimatUcreti: 9 },
    { bolgeAdi: 'Altindag', teslimatUcreti: 7 },
    { bolgeAdi: 'Golbasi', teslimatUcreti: 10 }
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
      adSoyad: 'Yonetici Hesabi',
      email: 'admin@flowershop.com',
      sifreHash: adminSifreHash,
      rol: 'ADMIN'
    }
  });

  // Ornek urunler
  await prisma.urun.createMany({
    data: [
      { ad: 'Kirmizi Lale Buketi', aciklama: 'Taze kirmizi lalelerden olusan buket', fiyat: 15, stokAdedi: 20, kategoriId: kategoriler[0].id },
      { ad: 'Beyaz Kazablanka', aciklama: 'Beyaz lilyum/kazablanka aranjmani', fiyat: 25, stokAdedi: 15, kategoriId: kategoriler[1].id },
      { ad: 'Pembe Orkide', aciklama: 'Saksida pembe orkide', fiyat: 35, stokAdedi: 10, kategoriId: kategoriler[2].id },
      { ad: 'Kirmizi Gul Buketi (11 adet)', aciklama: 'Klasik kirmizi gul buketi', fiyat: 20, stokAdedi: 25, kategoriId: kategoriler[3].id },
      { ad: 'Dogum Gunu Ozel Aranjmani', aciklama: 'Karisik cicek ve balon ile ozel aranjman', fiyat: 40, stokAdedi: 8, kategoriId: kategoriler[4].id }
    ]
  });

  console.log('Baslangic verileri basariyla eklendi.');
  console.log('Ornek admin girisi -> email: admin@flowershop.com | sifre: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });