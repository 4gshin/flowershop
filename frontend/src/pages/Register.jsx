// Kayit olma sayfasi
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import BotanicalDivider from '../components/BotanicalDivider';

function Register() {
  const [form, setForm] = useState({ adSoyad: '', email: '', sifre: '', telefon: '', adres: '' });
  const [hata, setHata] = useState('');
  const [basarili, setBasarili] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const navigate = useNavigate();

  function alanDegisti(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function formGonder(e) {
    e.preventDefault();
    setHata('');
    setGonderiliyor(true);

    try {
      await api.post('/auth/kayit', form);
      setBasarili(true);
      setTimeout(() => navigate('/giris'), 1500);
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-8">
        <span className="text-moss text-sm tracking-widest uppercase">Aramıza Katılın</span>
        <h1 className="font-display text-3xl text-ink mt-2">Kayıt Ol</h1>
        <BotanicalDivider className="w-20 mx-auto mt-4" />
      </div>

      {basarili ? (
        <p className="text-moss text-center">
          Kaydınız oluşturuldu, giriş sayfasına yönlendiriliyorsunuz...
        </p>
      ) : (
        <form onSubmit={formGonder} className="space-y-4">
          <div>
            <label className="block text-sm text-charcoal/70 mb-1">Ad Soyad</label>
            <input
              name="adSoyad"
              onChange={alanDegisti}
              required
              className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm text-charcoal/70 mb-1">E-posta</label>
            <input
              type="email"
              name="email"
              onChange={alanDegisti}
              required
              className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm text-charcoal/70 mb-1">Şifre</label>
            <input
              type="password"
              name="sifre"
              onChange={alanDegisti}
              required
              className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm text-charcoal/70 mb-1">Telefon</label>
            <input
              name="telefon"
              onChange={alanDegisti}
              className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm text-charcoal/70 mb-1">Adres</label>
            <input
              name="adres"
              onChange={alanDegisti}
              className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
            />
          </div>

          {hata && <p className="text-sm text-rose-dark">{hata}</p>}

          <button
            type="submit"
            disabled={gonderiliyor}
            className="w-full bg-ink text-paper py-3 rounded-full hover:bg-ink-light transition-colors disabled:opacity-60"
          >
            {gonderiliyor ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>
      )}

      <p className="text-sm text-charcoal/60 mt-6 text-center">
        Zaten hesabınız var mı?{' '}
        <Link to="/giris" className="text-rose hover:underline">Giriş Yapın</Link>
      </p>
    </div>
  );
}

export default Register;
