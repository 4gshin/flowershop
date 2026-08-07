// Hesabim sayfasi - kullanicinin profil bilgilerini ve siparis gecmisini gosterir
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BotanicalDivider from '../components/BotanicalDivider';
import Spinner from '../components/Spinner';

const DURUM_ETIKETLERI = {
  ALINDI: { metin: 'Alındı', renk: 'bg-gold/20 text-gold' },
  HAZIRLANIYOR: { metin: 'Hazırlanıyor', renk: 'bg-rose/20 text-rose-dark' },
  YOLDA: { metin: 'Yolda', renk: 'bg-moss/20 text-moss' },
  TESLIM_EDILDI: { metin: 'Teslim Edildi', renk: 'bg-ink/10 text-ink' },
  IPTAL: { metin: 'İptal', renk: 'bg-red-100 text-red-700' }
};

function Account() {
  const { kullanici, yukleniyor } = useAuth();
  const navigate = useNavigate();
  const [siparisler, setSiparisler] = useState([]);
  const [siparislerYukleniyor, setSiparislerYukleniyor] = useState(true);

  useEffect(() => {
    if (!yukleniyor && !kullanici) {
      navigate('/giris');
    }
  }, [kullanici, yukleniyor, navigate]);

  useEffect(() => {
    if (kullanici) {
      api.get('/siparisler/benim-siparislerim')
        .then((yanit) => setSiparisler(yanit.data))
        .catch(() => setSiparisler([]))
        .finally(() => setSiparislerYukleniyor(false));
    }
  }, [kullanici]);

  if (yukleniyor || !kullanici) {
    return <Spinner metin="Yükleniyor..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <span className="text-moss text-sm tracking-widest uppercase">Hesabım</span>
        <h1 className="font-display text-3xl text-ink mt-2">Merhaba, {kullanici.adSoyad}</h1>
        <BotanicalDivider className="w-20 mx-auto mt-4" />
      </div>

      <div className="bg-paper-dark/50 rounded-2xl p-6 mb-12 grid md:grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-charcoal/50 uppercase tracking-wide">E-posta</span>
          <p className="text-ink">{kullanici.email}</p>
        </div>
        <div>
          <span className="text-xs text-charcoal/50 uppercase tracking-wide">Telefon</span>
          <p className="text-ink">{kullanici.telefon || '—'}</p>
        </div>
        <div className="md:col-span-2">
          <span className="text-xs text-charcoal/50 uppercase tracking-wide">Adres</span>
          <p className="text-ink">{kullanici.adres || '—'}</p>
        </div>
      </div>

      <h2 className="font-display text-2xl text-ink mb-6">Siparişlerim</h2>

      {siparislerYukleniyor ? (
        <Spinner boyut="sm" metin="Siparişler yükleniyor..." />
      ) : siparisler.length === 0 ? (
        <div className="text-center py-12 bg-paper-dark/30 rounded-2xl">
          <p className="text-charcoal/60 mb-4">Henüz bir siparişiniz yok.</p>
          <Link to="/urunler" className="text-rose hover:underline">Ürünlere göz atın &rarr;</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {siparisler.map((siparis) => {
            const etiket = DURUM_ETIKETLERI[siparis.durum] || DURUM_ETIKETLERI.ALINDI;
            return (
              <div key={siparis.id} className="border border-ink/10 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="font-display text-lg text-ink">Sipariş #{siparis.id}</span>
                    <p className="text-xs text-charcoal/50">
                      {new Date(siparis.olusturmaTarihi).toLocaleDateString('tr-TR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${etiket.renk}`}>
                    {etiket.metin}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  {siparis.kalemler.map((kalem) => (
                    <div key={kalem.id} className="flex justify-between text-sm text-charcoal/70">
                      <span>{kalem.urun.ad} × {kalem.adet}</span>
                      <span>{(Number(kalem.birimFiyat) * kalem.adet).toFixed(2)} TL</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-3 border-t border-ink/10 text-sm text-charcoal/60">
                  <span>Teslimat: {siparis.teslimatBolgesi?.bolgeAdi}</span>
                  <span className="font-medium text-ink">
                    Toplam: {Number(siparis.genelToplam).toFixed(2)} TL
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Account;
