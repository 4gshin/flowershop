// Tekil urun detay sayfasi - sepete ekleme burada yapilir
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import BotanicalDivider from '../components/BotanicalDivider';

function ProductDetail() {
  const { id } = useParams();
  const [urun, setUrun] = useState(null);
  const [adet, setAdet] = useState(1);
  const [mesaj, setMesaj] = useState('');

  useEffect(() => {
    api.get(`/urunler/${id}`).then((yanit) => setUrun(yanit.data));
  }, [id]);

  function sepeteEkle() {
    const sepet = JSON.parse(localStorage.getItem('flowershop_sepet') || '[]');
    const mevcutKalem = sepet.find((k) => k.urunId === urun.id);

    if (mevcutKalem) {
      mevcutKalem.adet += adet;
    } else {
      sepet.push({ urunId: urun.id, ad: urun.ad, fiyat: urun.fiyat, gorselUrl: urun.gorselUrl, adet });
    }

    localStorage.setItem('flowershop_sepet', JSON.stringify(sepet));
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
        <div className="aspect-square bg-rose/10 rounded-2xl flex items-center justify-center overflow-hidden">
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
              className="w-20 border border-ink/20 rounded-full px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-rose"
            />
            <button
              onClick={sepeteEkle}
              className="bg-ink text-paper px-8 py-3 rounded-full hover:bg-ink-light transition-colors"
            >
              Sepete Ekle
            </button>
          </div>

          {mesaj && <p className="text-moss mt-4">{mesaj}</p>}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
