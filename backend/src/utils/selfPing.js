// Render'in ucretsiz plani, 15 dakika istek almayan servisleri uyku moduna aliyor.
// Bu fonksiyon, sunucu ayaktayken kendi kendine belirli araliklarla istek atarak
// uyku moduna gecmesini engeller. Sunucu zaten uykuya dalmissa bu mekanizma calismaz,
// bu durumda siteyi bir kez disaridan (tarayicidan) ziyaret ederek uyandirmak gerekir.
const cron = require('node-cron');

function selfPingBaslat() {
  const kendiUrl = process.env.SELF_URL;

  if (!kendiUrl) {
    console.log('SELF_URL tanimli degil, self-ping devre disi.');
    return;
  }

  // Her 10 dakikada bir kendi "/api/durum" ucuna istek atar (Render'in 15 dakikalik
  // uyku suresinden once, uyku moduna gecmesini engellemek icin)
  cron.schedule('*/10 * * * *', async () => {
    try {
      const yanit = await fetch(`${kendiUrl}/api/durum`);
      console.log(`Self-ping basarili: ${yanit.status} - ${new Date().toLocaleString('tr-TR')}`);
    } catch (hata) {
      console.error('Self-ping basarisiz:', hata.message);
    }
  });

  console.log('Self-ping successfully started.');
}

module.exports = selfPingBaslat;