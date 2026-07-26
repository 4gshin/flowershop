// Urun listelerinde kullanilan kart bileseni
import { Link } from 'react-router-dom';

function ProductCard({ urun }) {
  return (
    <Link
      to={`/urunler/${urun.id}`}
      className="group block bg-paper-dark/50 rounded-2xl overflow-hidden border border-ink/5 hover:border-rose/40 transition-colors"
    >
      <div className="aspect-square bg-rose/10 flex items-center justify-center overflow-hidden">
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
      </div>
    </Link>
  );
}

export default ProductCard;