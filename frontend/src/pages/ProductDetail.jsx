// Tekil urun detay sayfasi - sepete ekleme burada yapilir
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

  useEffect(() => {
    api.get(`/urunler/${id}`).then((yanit) => setUrun(yanit.data));
  }, [id]);

  const stoktaYok = urun && urun.stokAdedi <= 0;

  function ekle() {
    if (stoktaYok) return;
    sepeteEkle(urun, adet);
    setMesaj('Ürün sepete eklendi.');
  }

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
    </div>
  );
}

export default ProductDetail;
