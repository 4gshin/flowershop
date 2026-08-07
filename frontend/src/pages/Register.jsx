// Kayit olma sayfasi - sifre goster/gizle destegi ile
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import BotanicalDivider from '../components/BotanicalDivider';

function Register() {
  const [form, setForm] = useState({ adSoyad: '', email: '', sifre: '', telefon: '', adres: '' });
  const [hata, setHata] = useState('');
  const [basarili, setBasarili] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [sifreGorunur, setSifreGorunur] = useState(false);
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
            <div className="relative">
              <input
                type={sifreGorunur ? 'text' : 'password'}
                name="sifre"
                onChange={alanDegisti}
                required
                minLength={6}
                className="w-full border border-ink/20 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
              />
              <button
                type="button"
                onClick={() => setSifreGorunur(!sifreGorunur)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/50 hover:text-rose transition-colors"
                aria-label={sifreGorunur ? 'Sifreyi gizle' : 'Sifreyi goster'}
              >
                {sifreGorunur ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-charcoal/50 mt-1">En az 6 karakter olmalıdır.</p>
          </div>
          <div>
            <label className="block text-sm text-charcoal/70 mb-1">Telefon</label>
            <input
              name="telefon"
              type="tel"
              inputMode="numeric"
              value={form.telefon}
              onChange={(e) => setForm({ ...form, telefon: e.target.value.replace(/\D/g, '') })}
              maxLength={11}
              placeholder="05XXXXXXXXX"
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
            className="w-full bg-ink text-paper py-3 rounded-full hover:bg-ink-light transition-all duration-200 active:scale-95 disabled:opacity-60"
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
