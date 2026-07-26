// Ust menu - kategori linkleri, botanik imza ve kullanici islemlerini icerir
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BotanicalDivider from './BotanicalDivider';

function Navbar() {
  const { kullanici, cikisYap } = useAuth();

  return (
    <header className="bg-paper border-b border-ink/10 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl text-ink tracking-tight">
          FlowerShop
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-charcoal">
          <Link to="/urunler?kategori=Lale" className="hover:text-rose transition-colors">Lale</Link>
          <Link to="/urunler?kategori=Lilyum" className="hover:text-rose transition-colors">Lilyum</Link>
          <Link to="/urunler?kategori=Orkide" className="hover:text-rose transition-colors">Orkide</Link>
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
                className="bg-ink text-paper px-5 py-2 rounded-full hover:bg-ink-light transition-colors"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center pb-2">
        <BotanicalDivider className="w-24 opacity-60" />
      </div>
    </header>
  );
}

export default Navbar;