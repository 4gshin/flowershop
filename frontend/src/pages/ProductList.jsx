// Urunlerin listelendigi sayfa - kategoriye gore filtreleme ve isim uzerinden arama
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

function ProductList() {
  const [urunler, setUrunler] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const secilenKategori = searchParams.get('kategori');

  useEffect(() => {
    api.get('/kategoriler').then((yanit) => setKategoriler(yanit.data));
  }, []);

  useEffect(() => {
    setYukleniyor(true);
    api.get('/urunler')
      .then((yanit) => {
        let sonuc = yanit.data;
        if (secilenKategori) {
          sonuc = sonuc.filter((u) => u.kategori?.ad === secilenKategori);
        }
        setUrunler(sonuc);
      })
      .catch(() => setUrunler([]))
      .finally(() => setYukleniyor(false));
  }, [secilenKategori]);

  function kategoriSec(ad) {
    if (ad) {
      setSearchParams({ kategori: ad });
    } else {
      setSearchParams({});
    }
    setArama(''); // Kategori degistiginde arama sifirlanir
  }

  const tumKategoriler = kategoriler.flatMap((k) => [k, ...(k.altKategoriler || [])]);

  // Arama filtrelemesi kategori filtresinden sonra uygulanir
  const aramaAlt = arama.trim().toLowerCase();
  const gosterilenUrunler = aramaAlt
    ? urunler.filter((u) => u.ad.toLowerCase().includes(aramaAlt))
    : urunler;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <span className="text-moss text-sm tracking-widest uppercase">Koleksiyon</span>
        <h1 className="font-display text-4xl text-ink mt-2">
          {secilenKategori || 'Tüm Ürünler'}
        </h1>
      </div>

      {/* Arama cubuguSu - minimal, alt cizgili */}
      <div className="max-w-md mx-auto mb-8 relative">
        <input
          type="text"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Ürün ara..."
          className="w-full bg-transparent border-b border-ink/20 py-3 pl-8 pr-10 text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-rose transition-colors"
        />
        <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
        {arama && (
          <button
            onClick={() => setArama('')}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-rose text-xl leading-none"
            aria-label="Aramayi temizle"
          >
            ×
          </button>
        )}
      </div>

      {/* Kategori filtre cubuguSu */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button
          onClick={() => kategoriSec(null)}
          className={`px-5 py-2 rounded-full text-sm border transition-colors ${
            !secilenKategori ? 'bg-ink text-paper border-ink' : 'border-ink/20 text-charcoal hover:border-ink'
          }`}
        >
          Tümü
        </button>
        {tumKategoriler.map((kategori) => (
          <button
            key={kategori.id}
            onClick={() => kategoriSec(kategori.ad)}
            className={`px-5 py-2 rounded-full text-sm border transition-colors ${
              secilenKategori === kategori.ad ? 'bg-ink text-paper border-ink' : 'border-ink/20 text-charcoal hover:border-ink'
            }`}
          >
            {kategori.ad}
          </button>
        ))}
      </div>

      {yukleniyor ? (
        <p className="text-center text-charcoal/60">Ürünler yükleniyor...</p>
      ) : gosterilenUrunler.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-charcoal/60">
            {aramaAlt
              ? `"${arama}" için ürün bulunamadı.`
              : 'Bu kategoride henüz ürün bulunmuyor.'}
          </p>
          {aramaAlt && (
            <button
              onClick={() => setArama('')}
              className="text-rose hover:underline text-sm mt-3"
            >
              Aramayı temizle
            </button>
          )}
        </div>
      ) : (
        <>
          {aramaAlt && (
            <p className="text-center text-sm text-charcoal/50 mb-6">
              {gosterilenUrunler.length} Ürün bulundu
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {gosterilenUrunler.map((urun) => (
              <ProductCard key={urun.id} urun={urun} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductList;
