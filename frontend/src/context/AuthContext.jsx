// Kullanicinin giris durumunu tum uygulama boyunca takip eden context
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [kullanici, setKullanici] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('flowershop_token');
    if (token) {
      api.get('/auth/profil')
        .then((yanit) => setKullanici(yanit.data))
        .catch(() => localStorage.removeItem('flowershop_token'))
        .finally(() => setYukleniyor(false));
    } else {
      setYukleniyor(false);
    }
  }, []);

  function girisYap(token, kullaniciVerisi) {
    localStorage.setItem('flowershop_token', token);
    setKullanici(kullaniciVerisi);
  }

  function cikisYap() {
    localStorage.removeItem('flowershop_token');
    setKullanici(null);
  }

  return (
    <AuthContext.Provider value={{ kullanici, girisYap, cikisYap, yukleniyor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}