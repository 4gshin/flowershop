// Tekil ürün detay sayfası - sepete ekleme ve 1-5 yıldız değerlendirme yorum sistemi
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import BotanicalDivider from '../components/BotanicalDivider';
import { sepeteEkle } from '../utils/cart';

function ProductDetail() {
  const { id } = useParams();
  const [urun, setUrun] = useState(null);
  const [adet, setAdet] = useState(1);
  const [mesaj, setMesaj] = useState('');

  // ================= YORUM VE REYTİNG STATE'LERİ =================
  const [yorumlar, setYorumlar] = useState([]);
  const [ortalamaPuan, setOrtalamaPuan] = useState(0);
  const [toplamYorum, setToplamYorum] = useState(0);
  const [yorumYukleniyor, setYorumYukleniyor] = useState(true);

  // Yeni yorum formu state'leri
  const [puanSecimi, setPuanSecimi] = useState(5); // Varsayılan 5 yıldız
  const [kullaniciAd, setKullaniciAd] = useState('');
  const [yorumMetni, setYorumMetni] = useState('');
  const [yorumGonderiliyor, setYorumGonderiliyor] = useState(false);
  const [yorumHata, setYorumHata] = useState('');
  const [yorumBasarili, setYorumBasarili] = useState('');

  // Ürün bilgisini ve yorumları API'den çek
  useEffect(() => {
    // Ürün bilgisini al
    api.get(`/urunler/${id}`).then((yanit) => setUrun(yanit.data));

    // Yorumları al
    yorumlariGetir();
  }, [id]);

  const yorumlariGetir = async () => {
    setYorumYukleniyor(true);
    try {
      const res = await api.get(`/yorumlar/urun/${id}`);
      setYorumlar(res.data.yorumlar || []);
      setOrtalamaPuan(res.data.ortalamaPuan || 0);
      setToplamYorum(res.data.toplamYorum || 0);
    } catch (err) {
      console.error('Yorumlar yüklenirken hata:', err);
    } finally {
      setYorumYukleniyor(false);
    }
  };

  const stoktaYok = urun && urun.stokAdedi <= 0;

  function ekle() {
    if (stoktaYok) return;
    sepeteEkle(urun, adet);
    setMesaj('Ürün sepete eklendi.');
  }

  // Yeni yorum gönderme işlevi
  const handleYorumGonder = async (e) => {
    e.preventDefault();
    setYorumHata('');
    setYorumBasarili('');

    if (!kullaniciAd.trim()) {
      setYorumHata('Lütfen adınızı giriniz.');
      return;
    }

    setYorumGonderiliyor(true);
    try {
      await api.post('/yorumlar', {
        urunId: Number(id),
        puan: Number(puanSecimi),
        yorum: yorumMetni,
        kullaniciAd: kullaniciAd.trim()
      });

      setYorumBasarili('Değerlendirmeniz başarıyla eklendi. Teşekkür ederiz!');
      setYorumMetni('');
      setKullaniciAd('');
      setPuanSecimi(5);

      // Yorumları ve puanı yeniden yükle
      yorumlariGetir();
    } catch (err) {
      setYorumHata(err.response?.data?.mesaj || 'Yorum eklenirken bir hata oluştu.');
    } finally {
      setYorumGonderiliyor(false);
    }
  };

  // Yıldızları görsel olarak oluşturan yardımcı fonksiyon
  const yildizGoster = (puan, boyut = 'text-base') => {
    return (
      <div className={`flex items-center gap-0.5 ${boyut}`}>
        {[1, 2, 3, 4, 5].map((yildiz) => (
          <span
            key={yildiz}
            className={yildiz <= puan ? 'text-amber-500' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (!urun) {
    return <p className="text-center py-24 text-charcoal/50">Yükleniyor...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <Link to="/urunler" className="text-sm text-charcoal/60 hover:text-rose transition-colors">
        &larr; Tüm Ürünlere Dön
      </Link>

      <div className="grid md:grid-cols-2 gap-12 mt-8">
        <div className={`aspect-square bg-rose/10 rounded-2xl flex items-center justify-center overflow-hidden relative ${stoktaYok ? 'grayscale opacity-60' : ''}`}>
          {stoktaYok && (
            <span className="absolute top-4 left-4 z-10 bg-ink text-paper text-xs px-3 py-1 rounded-full">
              Tükendi
            </span>
          )}
          {urun.gorselUrl ? (
            <img src={urun.gorselUrl} alt={urun.ad} className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 60 60" className="w-24 h-24 opacity-30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="20" r="10" fill="#B8737A" />
              <path d="M30 30 L30 55" stroke="#6B7F5B" strokeWidth="2" />
            </svg>
          )}
        </div>

        <div>
          <span className="text-moss text-sm tracking-widest uppercase">{urun.kategori?.ad}</span>
          <h1 className="font-display text-4xl text-ink mt-2">{urun.ad}</h1>
          
          {/* Ortalama Yıldız ve Yorum Özeti */}
          <div className="flex items-center gap-2 mt-3">
            {yildizGoster(Math.round(ortalamaPuan), 'text-lg')}
            <span className="text-sm font-semibold text-ink">{ortalamaPuan > 0 ? ortalamaPuan : 'Yeni'}</span>
            <span className="text-sm text-charcoal/60">({toplamYorum} Değerlendirme)</span>
          </div>

          <BotanicalDivider className="w-20 mt-4" />
          <p className="text-rose text-2xl font-medium mt-6">{Number(urun.fiyat).toFixed(2)} TL</p>
          <p className="text-charcoal/70 mt-4 leading-relaxed">{urun.aciklama}</p>

          <div className="flex items-center gap-4 mt-8">
            <input
              type="number"
              min="1"
              value={adet}
              onChange={(e) => setAdet(Number(e.target.value))}
              disabled={stoktaYok}
              className="w-20 border border-ink/20 rounded-full px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-rose disabled:opacity-50"
            />
            <button
              onClick={ekle}
              disabled={stoktaYok}
              className={`px-8 py-3 rounded-full transition-colors ${
                stoktaYok
                  ? 'bg-ink/10 text-charcoal/40 cursor-not-allowed'
                  : 'bg-ink text-paper hover:bg-ink-light'
              }`}
            >
              {stoktaYok ? 'Stokta Yok' : 'Sepete Ekle'}
            </button>
          </div>

          {mesaj && !stoktaYok && <p className="text-moss mt-4">{mesaj}</p>}
        </div>
      </div>

      {/* ==================== YORUM VE DEĞERLENDİRME BÖLÜMÜ ==================== */}
      <div className="mt-20 pt-12 border-t border-ink/10">
        <h2 className="font-display text-2xl text-ink mb-6">Müşteri Değerlendirmeleri</h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Yorum Yazma Formu */}
          <div className="bg-paper-dark/30 p-6 rounded-2xl border border-ink/10">
            <h3 className="font-display text-lg text-ink mb-4">Bir Değerlendirme Yazın</h3>
            
            <form onSubmit={handleYorumGonder} className="space-y-4">
              <div>
                <label className="block text-sm text-charcoal/70 mb-1">Puanınız</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((yildiz) => (
                    <button
                      type="button"
                      key={yildiz}
                      onClick={() => setPuanSecimi(yildiz)}
                      className="text-2xl focus:outline-none hover:scale-110 transition-transform"
                    >
                      <span className={yildiz <= puanSecimi ? 'text-amber-500' : 'text-gray-300'}>
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-charcoal/60 ml-2">
                    ({puanSecimi} / 5 Yıldız)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-charcoal/70 mb-1">Adınız Soyadınız</label>
                <input
                  type="text"
                  required
                  value={kullaniciAd}
                  onChange={(e) => setKullaniciAd(e.target.value)}
                  placeholder="Örn: Ayşe Yılmaz"
                  className="w-full border border-ink/20 rounded-xl px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal/70 mb-1">Yorumunuz (İsteğe bağlı)</label>
                <textarea
                  rows="3"
                  value={yorumMetni}
                  onChange={(e) => setYorumMetni(e.target.value)}
                  placeholder="Bu çiçek hakkında düşünceleriniz..."
                  className="w-full border border-ink/20 rounded-xl px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
                />
              </div>

              {yorumHata && <p className="text-xs text-rose">{yorumHata}</p>}
              {yorumBasarili && <p className="text-xs text-moss font-medium">{yorumBasarili}</p>}

              <button
                type="submit"
                disabled={yorumGonderiliyor}
                className="bg-ink text-paper px-6 py-2.5 rounded-full text-sm hover:bg-ink-light transition-colors disabled:opacity-60"
              >
                {yorumGonderiliyor ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
              </button>
            </form>
          </div>

          {/* Mevcut Yorumlar Listesi */}
          <div className="space-y-4">
            {yorumYukleniyor ? (
              <p className="text-charcoal/50 text-sm">Yorumlar yükleniyor...</p>
            ) : yorumlar.length === 0 ? (
              <div className="text-center py-12 bg-paper-dark/20 rounded-2xl border border-ink/5">
                <p className="text-charcoal/60 text-sm">Henüz bir değerlendirme yapılmamış.</p>
                <p className="text-xs text-charcoal/40 mt-1">İlk yorumu siz yapın!</p>
              </div>
            ) : (
              yorumlar.map((item) => (
                <div key={item.id} className="p-4 bg-white rounded-xl border border-ink/10 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-ink">{item.kullaniciAd}</span>
                    <span className="text-xs text-charcoal/40">
                      {new Date(item.olusturmaTarihi).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  {yildizGoster(item.puan, 'text-sm')}
                  {item.yorum && <p className="text-sm text-charcoal/80 leading-normal">{item.yorum}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* ==================== YORUM BÖLÜMÜ SONU ==================== */}

    </div>
  );
}

export default ProductDetail;