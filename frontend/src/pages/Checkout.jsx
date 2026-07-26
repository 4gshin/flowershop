// Siparis tamamlama sayfasi - teslimat bolgesi secimine gore ucret otomatik hesaplanir
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BotanicalDivider from '../components/BotanicalDivider';

function Checkout() {
  const [sepet, setSepet] = useState([]);
  const [bolgeler, setBolgeler] = useState([]);
  const [secilenBolgeId, setSecilenBolgeId] = useState('');
  const [form, setForm] = useState({ teslimatAdresi: '', aliciAdSoyad: '', aliciTelefon: '', not: '' });
  const [siparisTamamlandi, setSiparisTamamlandi] = useState(false);
  const [hata, setHata] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);

  const { kullanici, yukleniyor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setSepet(JSON.parse(localStorage.getItem('flowershop_sepet') || '[]'));
    api.get('/teslimat-bolgeleri').then((yanit) => setBolgeler(yanit.data));
  }, []);

  const urunToplami = sepet.reduce((acc, k) => acc + Number(k.fiyat) * k.adet, 0);
  const secilenBolge = bolgeler.find((b) => b.id === Number(secilenBolgeId));
  const teslimatUcreti = secilenBolge ? Number(secilenBolge.teslimatUcreti) : 0;
  const genelToplam = urunToplami + teslimatUcreti;

  function alanDegisti(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function siparisiTamamla(e) {
    e.preventDefault();
    setHata('');

    if (!secilenBolgeId) {
      setHata('Lütfen bir teslimat bölgesi seçin.');
      return;
    }

    setGonderiliyor(true);
    try {
      await api.post('/siparisler', {
        urunler: sepet.map((k) => ({ urunId: k.urunId, adet: k.adet })),
        teslimatBolgesiId: Number(secilenBolgeId),
        ...form
      });

      localStorage.removeItem('flowershop_sepet');
      setSiparisTamamlandi(true);
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Sipariş oluşturulurken bir hata oluştu.');
    } finally {
      setGonderiliyor(false);
    }
  }

  // Oturum kontrolu henuz tamamlanmadiysa bekle
  if (yukleniyor) {
    return <p className="text-center py-24 text-charcoal/50">Yükleniyor...</p>;
  }

  // Giris yapmamis kullanici siparis veremez
  if (!kullanici) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-4">Giriş Yapmanız Gerekiyor</h1>
        <p className="text-charcoal/70 mb-6">Sipariş verebilmek için önce giriş yapmalısınız.</p>
        <Link
          to="/giris"
          className="inline-block bg-ink text-paper px-8 py-3 rounded-full hover:bg-ink-light transition-colors"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  if (sepet.length === 0 && !siparisTamamlandi) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-charcoal/60 mb-4">Sepetiniz boş.</p>
        <Link to="/urunler" className="text-rose hover:underline">Ürünlere göz atın &rarr;</Link>
      </div>
    );
  }

  if (siparisTamamlandi) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <BotanicalDivider className="w-24 mx-auto mb-6" />
        <h1 className="font-display text-3xl text-ink">Siparişiniz Alındı</h1>
        <p className="text-charcoal/70 mt-4">
          En kısa sürede sizinle iletişime geçilecektir.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 bg-ink text-paper px-8 py-3 rounded-full hover:bg-ink-light transition-colors"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <span className="text-moss text-sm tracking-widest uppercase">Son Adım</span>
        <h1 className="font-display text-3xl text-ink mt-2">Sipariş Tamamla</h1>
      </div>

      <form onSubmit={siparisiTamamla} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-charcoal/70 mb-1">Alıcı Ad Soyad</label>
            <input
              name="aliciAdSoyad"
              onChange={alanDegisti}
              required
              className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm text-charcoal/70 mb-1">Alıcı Telefon</label>
            <input
              name="aliciTelefon"
              onChange={alanDegisti}
              required
              className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-charcoal/70 mb-1">Teslimat Bölgesi (İlçe)</label>
          <select
            value={secilenBolgeId}
            onChange={(e) => setSecilenBolgeId(e.target.value)}
            required
            className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
          >
            <option value="">Bölge Seçin</option>
            {bolgeler.map((bolge) => (
              <option key={bolge.id} value={bolge.id}>
                {bolge.bolgeAdi} — {Number(bolge.teslimatUcreti).toFixed(2)} TL
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-charcoal/70 mb-1">Açık Teslimat Adresi</label>
          <textarea
            name="teslimatAdresi"
            onChange={alanDegisti}
            required
            rows="3"
            className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
          />
        </div>

        <div>
          <label className="block text-sm text-charcoal/70 mb-1">Not (opsiyonel)</label>
          <textarea
            name="not"
            onChange={alanDegisti}
            rows="2"
            className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
          />
        </div>

        <div className="bg-paper-dark/50 rounded-2xl p-5 space-y-2 text-charcoal">
          <div className="flex justify-between text-sm">
            <span>Ürün Toplamı</span>
            <span>{urunToplami.toFixed(2)} TL</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Teslimat Ücreti</span>
            <span>{teslimatUcreti.toFixed(2)} TL</span>
          </div>
          <div className="flex justify-between font-display text-lg text-ink pt-2 border-t border-ink/10">
            <span>Genel Toplam</span>
            <span className="text-rose">{genelToplam.toFixed(2)} TL</span>
          </div>
        </div>

        {hata && <p className="text-sm text-rose-dark">{hata}</p>}

        <button
          type="submit"
          disabled={gonderiliyor}
          className="w-full bg-ink text-paper py-3 rounded-full hover:bg-ink-light transition-colors disabled:opacity-60"
        >
          {gonderiliyor ? 'Sipariş oluşturuluyor...' : 'Siparişi Onayla'}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
