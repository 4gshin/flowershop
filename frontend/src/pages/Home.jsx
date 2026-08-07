// Ana sayfa - hero, kategori vitrini, en cok satilanlar, teslimat bilgi, SSS
import { Link } from 'react-router-dom';
import BotanicalDivider from '../components/BotanicalDivider';
import SSS from '../components/SSS';
import EnCokSatilanlar from '../components/EnCokSatilanlar';

const kategoriler = [
  { ad: 'Lale', slug: 'Lale', renk: 'bg-rose/10' },
  { ad: 'Lilyum / Kazablanka', slug: 'Lilyum', renk: 'bg-moss/10' },
  { ad: 'Orkide', slug: 'Orkide', renk: 'bg-gold/10' },
  { ad: 'Gül', slug: 'Gul', renk: 'bg-rose/10' },
  { ad: 'Özel Günler', slug: 'Ozel Gunler', renk: 'bg-moss/10' }
];

function Home() {
  return (
    <div>
      {/* HERO - asimetrik bolum, koyu zemin uzerinde */}
      <section className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-3">
            <span className="text-gold text-sm tracking-widest uppercase">
              Taze Kesim, Günlük Teslimat
            </span>
            <h1 className="font-display text-5xl md:text-6xl leading-tight mt-4">
              Her Çiçek,<br />Bir Hikaye Anlatır
            </h1>
            <p className="text-paper/70 mt-6 max-w-md text-lg">
              Sevdikleriniz için özenle seçilmiş çiçek koleksiyonları — kapınıza kadar taze teslim.
            </p>
            <Link
              to="/urunler"
              className="inline-block mt-8 bg-rose text-paper px-8 py-3 rounded-full hover:bg-rose-dark transition-all duration-200 active:scale-95"
            >
              Koleksiyonu Keşfet
            </Link>
          </div>

          <div className="md:col-span-2 flex justify-center">
            <svg viewBox="0 0 200 260" className="w-48 md:w-64 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M100 260 C 100 180, 90 140, 100 60" stroke="#8A9C7A" strokeWidth="2" strokeLinecap="round" />
              <path d="M100 180 C 80 170, 65 155, 60 135 C 80 135, 95 150, 100 180" fill="#6B7F5B" />
              <path d="M100 150 C 120 140, 135 125, 140 105 C 120 105, 105 120, 100 150" fill="#8A9C7A" />
              <circle cx="100" cy="55" r="28" fill="#B8737A" />
              <circle cx="100" cy="55" r="16" fill="#D0959B" />
              <circle cx="100" cy="55" r="6" fill="#B8934B" />
            </svg>
          </div>
        </div>
      </section>

      {/* KATEGORI VITRINI */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-moss text-sm tracking-widest uppercase">Koleksiyonlar</span>
          <h2 className="font-display text-3xl text-ink mt-2">Kategorilere Göz Atın</h2>
          <BotanicalDivider className="w-28 mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {kategoriler.map((kategori) => (
            <Link
              key={kategori.slug}
              to={`/urunler?kategori=${encodeURIComponent(kategori.slug)}`}
              className={`${kategori.renk} rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform border border-ink/5`}
            >
              <span className="font-display text-lg text-ink">{kategori.ad}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* EN COK SATILANLAR */}
      <EnCokSatilanlar />

      {/* ALT BANNER - teslimat vurgusu */}
      <section className="bg-paper-dark py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="font-display text-2xl text-ink">Bölgenize Özel Teslimat</h3>
          <p className="text-charcoal/70 mt-3 max-w-lg mx-auto">
            Sipariş sırasında bölgenizi seçin, teslimat ücreti otomatik hesaplansın — aynı gün elden teslim imkanı ile.
          </p>
        </div>
      </section>

      <SSS />
    </div>
  );
}

export default Home;
