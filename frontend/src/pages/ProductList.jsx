// Urunlerin listelendigi sayfa - kategoriye gore filtreleme URL parametresi ile yapilir
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

function ProductList() {
  const [urunler, setUrunler] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
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
  }

  // Ust kategorileri ve alt kategorileri tek bir duz listeye ceviriyoruz (filtre butonlari icin)
  const tumKategoriler = kategoriler.flatMap((k) => [k, ...(k.altKategoriler || [])]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <span className="text-moss text-sm tracking-widest uppercase">Koleksiyon</span>
        <h1 className="font-display text-4xl text-ink mt-2">
          {secilenKategori || 'Tüm Ürünler'}
        </h1>
      </div>

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
      ) : urunler.length === 0 ? (
        <p className="text-center text-charcoal/60">Bu kategoride henüz ürün bulunmuyor.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {urunler.map((urun) => (
            <ProductCard key={urun.id} urun={urun} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;
