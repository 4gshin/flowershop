// Giris yapma sayfasi
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
          <input
            type="password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            required
            className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
          />
        </div>

        {hata && <p className="text-sm text-rose-dark">{hata}</p>}

        <button
          type="submit"
          disabled={gonderiliyor}
          className="w-full bg-ink text-paper py-3 rounded-full hover:bg-ink-light transition-colors disabled:opacity-60"
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
