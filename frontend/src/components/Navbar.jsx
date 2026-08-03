// Ust menu - kategori linkleri (alt kategori dropdown'lari ile), botanik imza ve kullanici islemlerini icerir
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Navbar() {
  const { kullanici, cikisYap } = useAuth();
  const [kategoriler, setKategoriler] = useState([]);
  const [acikKategoriId, setAcikKategoriId] = useState(null);

  useEffect(() => {
    api.get('/kategoriler').then((yanit) => setKategoriler(yanit.data));
  }, []);

  return (
    <header className="bg-paper border-b border-ink/10 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl text-ink tracking-tight">
          FlowerShop
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-charcoal">
          {kategoriler.map((kategori) => (
            <div
              key={kategori.id}
              className="relative"
              onMouseEnter={() => setAcikKategoriId(kategori.id)}
              onMouseLeave={() => setAcikKategoriId(null)}
            >
              <Link
                to={`/urunler?kategori=${encodeURIComponent(kategori.ad)}`}
                className="hover:text-rose transition-colors py-2 inline-block"
              >
                {kategori.ad}
              </Link>

              {kategori.altKategoriler?.length > 0 && acikKategoriId === kategori.id && (
                <div className="absolute top-full left-0 bg-paper border border-ink/10 rounded-xl shadow-lg py-2 min-w-[180px] z-30">
                  {kategori.altKategoriler.map((alt) => (
                    <Link
                      key={alt.id}
                      to={`/urunler?kategori=${encodeURIComponent(alt.ad)}`}
                      className="block px-4 py-2 text-sm hover:bg-rose/10 hover:text-rose transition-colors"
                    >
                      {alt.ad}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link to="/urunler" className="hover:text-rose transition-colors">Tüm Ürünler</Link>
        </nav>

        <div className="flex items-center gap-5 text-sm">
          <Link to="/sepet" className="text-charcoal hover:text-rose transition-colors">Sepetim</Link>

          {kullanici ? (
            <div className="flex items-center gap-4">
              <Link to="/hesabim" className="text-charcoal hover:text-rose transition-colors">
                {kullanici.adSoyad}
              </Link>
              {kullanici.rol === 'ADMIN' && (
                <Link to="/admin" className="text-moss font-medium hover:underline">
                  Yönetim Paneli
                </Link>
              )}
              <button onClick={cikisYap} className="text-charcoal/60 hover:text-rose transition-colors">
                Çıkış
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/giris" className="text-charcoal hover:text-rose transition-colors">Giriş Yap</Link>
              <Link
                to="/kayit"
                className="bg-ink text-paper px-5 py-2 rounded-full hover:bg-ink-light transition-all duration-200 active:scale-95"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>

     
    </header>
  );
}

export default Navbar;
