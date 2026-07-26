// Sepet ile ilgili ortak islemler - localStorage uzerinden yonetilir
export function sepeteEkle(urun, adet = 1) {
  const sepet = JSON.parse(localStorage.getItem('flowershop_sepet') || '[]');
  const mevcutKalem = sepet.find((k) => k.urunId === urun.id);

  if (mevcutKalem) {
    mevcutKalem.adet += adet;
  } else {
    sepet.push({
      urunId: urun.id,
      ad: urun.ad,
      fiyat: urun.fiyat,
      gorselUrl: urun.gorselUrl,
      adet
    });
  }

  localStorage.setItem('flowershop_sepet', JSON.stringify(sepet));
}
