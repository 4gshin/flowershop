// Sepet sayfasi - localStorage uzerinden yonetilen sepet burada gosterilir
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
  const [sepet, setSepet] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setSepet(JSON.parse(localStorage.getItem('flowershop_sepet') || '[]'));
  }, []);

  function adetGuncelle(urunId, yeniAdet) {
    if (yeniAdet < 1) return;
    const guncelSepet = sepet.map((k) => (k.urunId === urunId ? { ...k, adet: yeniAdet } : k));
    setSepet(guncelSepet);
    localStorage.setItem('flowershop_sepet', JSON.stringify(guncelSepet));
  }

  function urunSil(urunId) {
    const guncelSepet = sepet.filter((k) => k.urunId !== urunId);
    setSepet(guncelSepet);
    localStorage.setItem('flowershop_sepet', JSON.stringify(guncelSepet));
  }

  const toplam = sepet.reduce((acc, k) => acc + Number(k.fiyat) * k.adet, 0);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-8">Sepetim</h1>

      {sepet.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-charcoal/60 mb-4">Sepetiniz boş.</p>
          <Link to="/urunler" className="text-rose hover:underline">
            Ürünlere göz atın &rarr;
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {sepet.map((kalem) => (
              <div
                key={kalem.urunId}
                className="flex items-center justify-between bg-paper-dark/50 rounded-2xl p-4 border border-ink/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-rose/10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    {kalem.gorselUrl ? (
                      <img src={kalem.gorselUrl} alt={kalem.ad} className="w-full h-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 60 60" className="w-8 h-8 opacity-30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="30" cy="20" r="10" fill="#B8737A" />
                        <path d="M30 30 L30 55" stroke="#6B7F5B" strokeWidth="2" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-ink">{kalem.ad}</p>
                    <p className="text-sm text-charcoal/50">{Number(kalem.fiyat).toFixed(2)} TL</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => adetGuncelle(kalem.urunId, kalem.adet - 1)}
                    className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center hover:bg-ink/5"
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{kalem.adet}</span>
                  <button
                    onClick={() => adetGuncelle(kalem.urunId, kalem.adet + 1)}
                    className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center hover:bg-ink/5"
                  >
                    +
                  </button>
                  <button
                    onClick={() => urunSil(kalem.urunId)}
                    className="text-sm text-rose-dark hover:underline ml-2"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-ink/10">
            <p className="font-display text-xl text-ink">
              Ara Toplam: <span className="text-rose">{toplam.toFixed(2)} TL</span>
            </p>
            <button
              onClick={() => navigate('/odeme')}
              className="bg-ink text-paper px-8 py-3 rounded-full hover:bg-ink-light transition-colors"
            >
              Siparişe Devam Et
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
