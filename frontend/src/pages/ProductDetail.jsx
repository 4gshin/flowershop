// Tekil urun detay sayfasi - sepete ekleme ve 1-5 yildiz degerlendirme sistemi
// Sadece bu urunu almis ve teslim almis kullanicilar yorum yapabilir
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import BotanicalDivider from '../components/BotanicalDivider';
import { sepeteEkle } from '../utils/cart';
import { useAuth } from '../context/AuthContext';

function ProductDetail() {
  const { id } = useParams();
  const { kullanici } = useAuth();

  const [urun, setUrun] = useState(null);
  const [adet, setAdet] = useState(1);
  const [mesaj, setMesaj] = useState('');

  // Yorum listesi ve reyting
  const [yorumlar, setYorumlar] = useState([]);
  const [ortalamaPuan, setOrtalamaPuan] = useState(0);
  const [toplamYorum, setToplamYorum] = useState(0);
  const [yorumYukleniyor, setYorumYukleniyor] = useState(true);

  // Yorum yapma izni (backend'den gelir)
  const [yorumIzni, setYorumIzni] = useState(null);
  const [izinYukleniyor, setIzinYukleniyor] = useState(false);

  // Yeni yorum formu
  const [puanSecimi, setPuanSecimi] = useState(5);
  const [yorumMetni, setYorumMetni] = useState('');
  const [yorumGonderiliyor, setYorumGonderiliyor] = useState(false);
  const [yorumHata, setYorumHata] = useState('');
  const [yorumBasarili, setYorumBasarili] = useState('');

  useEffect(() => {
    api.get(`/urunler/${id}`).then((yanit) => setUrun(yanit.data));
    yorumlariGetir();
  }, [id]);

  // Kullanici giris yaptiginda / urun geldiginde yorum iznini kontrol et
  useEffect(() => {
    if (kullanici && id) {
      setIzinYukleniyor(true);
      api.get(`/yorumlar/hakkim-var-mi/${id}`)
        .then((yanit) => setYorumIzni(yanit.data))
        .catch(() => setYorumIzni({ yorumYapabilir: false }))
        .finally(() => setIzinYukleniyor(false));
    } else {
      setYorumIzni(null);
    }
  }, [kullanici, id]);

  const yorumlariGetir = async () => {
    setYorumYukleniyor(true);
    try {
      const res = await api.get(`/yorumlar/urun/${id}`);
      setYorumlar(res.data.yorumlar || []);
      setOrtalamaPuan(res.data.ortalamaPuan || 0);
      setToplamYorum(res.data.toplamYorum || 0);
    } catch (err) {
      console.error('Yorumlar yuklenirken hata:', err);
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

  const handleYorumGonder = async (e) => {
    e.preventDefault();
    setYorumHata('');
    setYorumBasarili('');
    setYorumGonderiliyor(true);

    try {
      // kullaniciAd artik gonderilmiyor - backend kendi bulup ekliyor
      await api.post('/yorumlar', {
        urunId: Number(id),
        puan: Number(puanSecimi),
        yorum: yorumMetni
      });

      setYorumBasarili('Değerlendirmeniz başarıyla eklendi. Teşekkür ederiz!');
      setYorumMetni('');
      setPuanSecimi(5);

      // Yorum sonrasi izni yenile (artik "zaten yorum yapti" olacak)
      const izinYanit = await api.get(`/yorumlar/hakkim-var-mi/${id}`);
      setYorumIzni(izinYanit.data);

      yorumlariGetir();
    } catch (err) {
      setYorumHata(err.response?.data?.mesaj || 'Yorum eklenirken bir hata oluştu.');
    } finally {
      setYorumGonderiliyor(false);
    }
  };

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

  // Yorum bolumu icin gosterilecek icerigi hesapla
  const yorumBolumuIcerik = () => {
    if (!kullanici) {
      return (
        <div className="bg-paper-dark/30 p-6 rounded-2xl border border-ink/10">
          <h3 className="font-display text-lg text-ink mb-2">Değerlendirme Yapın</h3>
          <p className="text-sm text-charcoal/70">
            Yorum yapmak için <Link to="/giris" className="text-rose hover:underline">giriş yapmalısınız</Link>.
          </p>
        </div>
      );
    }

    if (izinYukleniyor || !yorumIzni) {
      return (
        <div className="bg-paper-dark/30 p-6 rounded-2xl border border-ink/10">
          <p className="text-sm text-charcoal/50">Kontrol ediliyor...</p>
        </div>
      );
    }

    if (yorumIzni.sebep === 'satin_almadi') {
      return (
        <div className="bg-paper-dark/30 p-6 rounded-2xl border border-ink/10">
          <h3 className="font-display text-lg text-ink mb-2">Değerlendirme Yapın</h3>
          <p className="text-sm text-charcoal/70 leading-relaxed">
            Bu ürüne yorum yapabilmek için önce ürünü satın almış ve teslim almış olmanız gerekir.
            Bu, yalnızca gerçek müşterilerimizin değerlendirme yapmasını sağlar.
          </p>
        </div>
      );
    }

    if (yorumIzni.sebep === 'zaten_yorum_yapti') {
      return (
        <div className="bg-moss/10 p-6 rounded-2xl border border-moss/20">
          <h3 className="font-display text-lg text-ink mb-2">Değerlendirme Yaptınız</h3>
          <p className="text-sm text-charcoal/70">
            Bu ürüne daha önce bir yorum eklediğiniz için teşekkür ederiz.
          </p>
        </div>
      );
    }

    // yorumYapabilir === true - form goster
    return (
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
            <label className="block text-sm text-charcoal/70 mb-1">
              Yorumunuz <span className="text-charcoal/40">(isteğe bağlı)</span>
            </label>
            <textarea
              rows="3"
              value={yorumMetni}
              onChange={(e) => setYorumMetni(e.target.value)}
              placeholder="Bu ürün hakkında düşünceleriniz..."
              className="w-full border border-ink/20 rounded-xl px-4 py-2.5 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
            />
          </div>

          <p className="text-xs text-charcoal/50">
            Yorumunuz "{kullanici.adSoyad}" adıyla yayınlanacak.
          </p>

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
    );
  };

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

          {/* Ortalama Yildiz ve Yorum Ozeti */}
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

      {/* Yorum ve Degerlendirme Bolumu */}
      <div className="mt-20 pt-12 border-t border-ink/10">
        <h2 className="font-display text-2xl text-ink mb-6">Müşteri Değerlendirmeleri</h2>

        <div className="grid md:grid-cols-2 gap-12">
          {yorumBolumuIcerik()}

          {/* Mevcut Yorumlar Listesi */}
          <div className="space-y-4">
            {yorumYukleniyor ? (
              <p className="text-charcoal/50 text-sm">Yorumlar yükleniyor...</p>
            ) : yorumlar.length === 0 ? (
              <div className="text-center py-12 bg-paper-dark/20 rounded-2xl border border-ink/5">
                <p className="text-charcoal/60 text-sm">Henüz bir değerlendirme yapılmamış.</p>
                <p className="text-xs text-charcoal/40 mt-1">
                  Bu ürünü alan ilk müşteriler yorum yapabilir.
                </p>
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
    </div>
  );
}

export default ProductDetail;
