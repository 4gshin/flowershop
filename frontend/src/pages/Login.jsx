// Giris yapma sayfasi - sifre goster/gizle destegi ile
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BotanicalDivider from '../components/BotanicalDivider';

function Login() {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [sifreGorunur, setSifreGorunur] = useState(false);

  const { girisYap } = useAuth();
  const navigate = useNavigate();

  async function formGonder(e) {
    e.preventDefault();
    setHata('');
    setGonderiliyor(true);

    try {
      const yanit = await api.post('/auth/giris', { email, sifre });
      girisYap(yanit.data.token, yanit.data.kullanici);
      navigate('/');
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-8">
        <span className="text-moss text-sm tracking-widest uppercase">Hoş Geldiniz</span>
        <h1 className="font-display text-3xl text-ink mt-2">Giriş Yap</h1>
        <BotanicalDivider className="w-20 mx-auto mt-4" />
      </div>

      <form onSubmit={formGonder} className="space-y-4">
        <div>
          <label className="block text-sm text-charcoal/70 mb-1">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
          />
        </div>

        <div>
          <label className="block text-sm text-charcoal/70 mb-1">Şifre</label>
          <div className="relative">
            <input
              type={sifreGorunur ? 'text' : 'password'}
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              required
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
        </div>

        {hata && <p className="text-sm text-rose-dark">{hata}</p>}

        <button
          type="submit"
          disabled={gonderiliyor}
          className="w-full bg-ink text-paper py-3 rounded-full hover:bg-ink-light transition-all duration-200 active:scale-95 disabled:opacity-60"
        >
          {gonderiliyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="text-sm text-charcoal/60 mt-6 text-center">
        Hesabınız yok mu?{' '}
        <Link to="/kayit" className="text-rose hover:underline">Kayıt Olun</Link>
      </p>
    </div>
  );
}

export default Login;
