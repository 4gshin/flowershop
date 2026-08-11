// Admin dashboard - genel istatistikler, en cok satilanlar, son siparisler
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const DURUM_ETIKETLERI = {
  ALINDI: { metin: 'Alındı', renk: 'bg-gold/20 text-gold' },
  HAZIRLANIYOR: { metin: 'Hazırlanıyor', renk: 'bg-rose/20 text-rose-dark' },
  YOLDA: { metin: 'Yolda', renk: 'bg-moss/20 text-moss' },
  TESLIM_EDILDI: { metin: 'Teslim Edildi', renk: 'bg-ink/10 text-ink' },
  IPTAL: { metin: 'İptal', renk: 'bg-red-100 text-red-700' }
};

function IstatistikKart({ baslik, deger, altBaslik, ikon, renk = 'bg-paper-dark/40' }) {
  return (
    <div className={`${renk} rounded-2xl p-5 border border-ink/5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-charcoal/60 uppercase tracking-wide">{baslik}</p>
          <p className="font-display text-2xl text-ink mt-1">{deger}</p>
          {altBaslik && <p className="text-xs text-charcoal/50 mt-1">{altBaslik}</p>}
        </div>
        {ikon && <div className="text-rose text-2xl opacity-60">{ikon}</div>}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [veri, setVeri] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    api.get('/istatistikler')
      .then((yanit) => setVeri(yanit.data))
      .catch(() => setVeri(null))
      .finally(() => setYukleniyor(false));
  }, []);

  if (yukleniyor) {
    return <Spinner metin="İstatistikler yükleniyor..." />;
  }

  if (!veri) {
    return <p className="text-center text-charcoal/60 py-12">İstatistikler yüklenemedi.</p>;
  }

  const buAyBuyume = veri.oncekiAy.gelir > 0
    ? ((veri.buAy.gelir - veri.oncekiAy.gelir) / veri.oncekiAy.gelir * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      {/* Ust kartlar - genel sayilar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <IstatistikKart
          baslik="Toplam Ürün"
          deger={veri.genelSayilar.toplamUrun}
          altBaslik="Aktif ürünler"
          ikon="🌸"
        />
        <IstatistikKart
          baslik="Kayıtlı Müşteri"
          deger={veri.genelSayilar.toplamKullanici}
          altBaslik="Kullanıcı hesabı"
          ikon="👥"
        />
        <IstatistikKart
          baslik="Toplam Sipariş"
          deger={veri.genelSayilar.toplamSiparis}
          altBaslik="Tüm zamanlar"
          ikon="📦"
        />
        <IstatistikKart
          baslik="Toplam Gelir"
          deger={`${veri.genelSayilar.toplamGelir.toLocaleString('tr-TR')} TL`}
          altBaslik="Tüm siparişler"
          ikon="💰"
        />
      </div>

      {/* Bu ay istatistigi */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-rose/5 rounded-2xl p-6 border border-rose/10">
          <p className="text-xs text-charcoal/60 uppercase tracking-wide">Bu Ay</p>
          <p className="font-display text-3xl text-ink mt-2">
            {veri.buAy.gelir.toLocaleString('tr-TR')} TL
          </p>
          <p className="text-sm text-charcoal/60 mt-1">
            {veri.buAy.siparisSayisi} sipariş
          </p>
          {buAyBuyume !== null && (
            <p className={`text-sm mt-2 ${buAyBuyume >= 0 ? 'text-moss' : 'text-rose-dark'}`}>
              {buAyBuyume >= 0 ? '↑' : '↓'} Geçen aya göre %{Math.abs(buAyBuyume)}
            </p>
          )}
        </div>

        <div className="bg-moss/5 rounded-2xl p-6 border border-moss/10">
          <p className="text-xs text-charcoal/60 uppercase tracking-wide">Sipariş Durumları</p>
          <div className="mt-3 space-y-2">
            {veri.durumSayilari.length === 0 ? (
              <p className="text-sm text-charcoal/50">Henüz sipariş yok.</p>
            ) : (
              veri.durumSayilari.map((d) => {
                const etiket = DURUM_ETIKETLERI[d.durum] || DURUM_ETIKETLERI.ALINDI;
                return (
                  <div key={d.durum} className="flex items-center justify-between">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${etiket.renk}`}>
                      {etiket.metin}
                    </span>
                    <span className="text-ink font-medium">{d.sayi}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* En cok satilanlar + Son siparisler */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-display text-lg text-ink mb-4">En Çok Satılanlar</h2>
          {veri.enCokSatilanlar.length === 0 ? (
            <p className="text-charcoal/50 text-sm">Henüz satış verisi yok.</p>
          ) : (
            <div className="space-y-2">
              {veri.enCokSatilanlar.map((urun, index) => (
                <div key={urun.id} className="flex items-center gap-3 bg-paper-dark/30 p-3 rounded-xl border border-ink/5">
                  <span className="font-display text-lg text-rose/60 w-6">#{index + 1}</span>
                  <div className="w-10 h-10 bg-rose/10 rounded-lg overflow-hidden shrink-0">
                    {urun.gorselUrl ? (
                      <img src={urun.gorselUrl} alt={urun.ad} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{urun.ad}</p>
                    <p className="text-xs text-charcoal/50">{urun.satisAdedi} adet satıldı</p>
                  </div>
                  <span className="text-sm text-rose font-medium shrink-0">
                    {Number(urun.fiyat).toFixed(2)} TL
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display text-lg text-ink mb-4">Son Siparişler</h2>
          {veri.sonSiparisler.length === 0 ? (
            <p className="text-charcoal/50 text-sm">Henüz sipariş yok.</p>
          ) : (
            <div className="space-y-2">
              {veri.sonSiparisler.map((s) => {
                const etiket = DURUM_ETIKETLERI[s.durum] || DURUM_ETIKETLERI.ALINDI;
                return (
                  <div key={s.id} className="bg-paper-dark/30 p-3 rounded-xl border border-ink/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-ink">#{s.id} — {s.aliciAdSoyad}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${etiket.renk}`}>
                        {etiket.metin}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-charcoal/60">
                      <span>{new Date(s.olusturmaTarihi).toLocaleDateString('tr-TR')}</span>
                      <span className="text-rose font-medium">{s.genelToplam.toFixed(2)} TL</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
