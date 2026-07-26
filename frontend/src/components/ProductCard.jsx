// Urun listelerinde kullanilan kart bileseni
// Stok durumu ve hizli "Sepete Ekle" butonu icerir
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { sepeteEkle } from '../utils/cart';

function ProductCard({ urun }) {
  const [eklendi, setEklendi] = useState(false);
  const stoktaYok = urun.stokAdedi <= 0;

  function hizliEkle(e) {
    e.preventDefault(); // Link'in tetiklenmesini engeller (detay sayfasina gitmesin)
    e.stopPropagation();
    if (stoktaYok) return;

    sepeteEkle(urun, 1);
    setEklendi(true);
    setTimeout(() => setEklendi(false), 1500);
  }

  return (
    <Link
      to={`/urunler/${urun.id}`}
      className="group block bg-paper-dark/50 rounded-2xl overflow-hidden border border-ink/5 hover:border-rose/40 transition-colors relative"
    >
      {stoktaYok && (
        <span className="absolute top-3 left-3 z-10 bg-ink text-paper text-xs px-3 py-1 rounded-full">
          Tükendi
        </span>
      )}

      <div className={`aspect-square bg-rose/10 flex items-center justify-center overflow-hidden ${stoktaYok ? 'grayscale opacity-60' : ''}`}>
        {urun.gorselUrl ? (
          <img
            src={urun.gorselUrl}
            alt={urun.ad}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <svg viewBox="0 0 60 60" className="w-16 h-16 opacity-30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="20" r="10" fill="#B8737A" />
            <path d="M30 30 L30 55" stroke="#6B7F5B" strokeWidth="2" />
          </svg>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg text-ink">{urun.ad}</h3>
        <p className="text-sm text-charcoal/50 mt-1">{urun.kategori?.ad}</p>
        <p className="text-rose font-medium mt-3">{Number(urun.fiyat).toFixed(2)} TL</p>

        <button
          onClick={hizliEkle}
          disabled={stoktaYok}
          className={`w-full mt-4 py-2 rounded-full text-sm transition-colors ${
            stoktaYok
              ? 'bg-ink/10 text-charcoal/40 cursor-not-allowed'
              : eklendi
              ? 'bg-moss text-paper'
              : 'bg-ink text-paper hover:bg-ink-light'
          }`}
        >
          {stoktaYok ? 'Tükendi' : eklendi ? 'Eklendi ✓' : 'Sepete Ekle'}
        </button>
      </div>
    </Link>
  );
}

export default ProductCard;
