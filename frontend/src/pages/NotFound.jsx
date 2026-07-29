// Mevcut olmayan bir URL'e gidildiginde gosterilen sayfa
import { Link } from 'react-router-dom';
import BotanicalDivider from '../components/BotanicalDivider';

function NotFound() {
  return (
    <div className="max-w-md mx-auto px-6 py-32 text-center">
      <span className="font-display text-6xl text-rose">404</span>
      <h1 className="font-display text-2xl text-ink mt-4">Sayfa Bulunamadı</h1>
      <BotanicalDivider className="w-20 mx-auto mt-6" />
      <p className="text-charcoal/70 mt-6">
        Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.
      </p>
      <Link
        to="/"
        className="inline-block mt-8 bg-ink text-paper px-8 py-3 rounded-full hover:bg-ink-light transition-colors"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}

export default NotFound;
