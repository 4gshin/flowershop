// Ana sayfada en cok satilan urunleri gosteren bolum
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from './ProductCard';
import BotanicalDivider from './BotanicalDivider';
import Spinner from './Spinner';

function EnCokSatilanlar() {
  const [urunler, setUrunler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    api.get('/urunler/en-cok-satilanlar?limit=4')
      .then((yanit) => setUrunler(yanit.data))
      .catch(() => setUrunler([]))
      .finally(() => setYukleniyor(false));
  }, []);

  if (!yukleniyor && urunler.length === 0) {
    return null; // Hicbir urun yoksa bolumu tamamen gizle
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="flex flex-col items-center text-center mb-12">
        <span className="text-moss text-sm tracking-widest uppercase">Favoriler</span>
        <h2 className="font-display text-3xl text-ink mt-2">En Çok Tercih Edilenler</h2>
        <BotanicalDivider className="w-28 mt-4" />
        <p className="text-charcoal/60 text-sm mt-4 max-w-md">
          Müşterilerimizin en çok tercih ettiği çiçekler
        </p>
      </div>

      {yukleniyor ? (
        <Spinner metin="Yükleniyor..." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {urunler.map((urun) => (
            <ProductCard key={urun.id} urun={urun} />
          ))}
        </div>
      )}

      <div className="text-center mt-10">
        <Link
          to="/urunler"
          className="inline-block text-charcoal hover:text-rose transition-colors text-sm border-b border-charcoal/20 hover:border-rose pb-1"
        >
          Tüm ürünleri keşfet &rarr;
        </Link>
      </div>
    </section>
  );
}

export default EnCokSatilanlar;
