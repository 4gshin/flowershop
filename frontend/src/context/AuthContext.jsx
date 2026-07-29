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
        .catch((hata) => {
          // Sadece token gercekten gecersizse (401) sil.
          // Diger hatalarda (backend henuz ayakta degil, ag sorunu vb.)
          // token'a dokunma - kullanici gereksiz yere oturumdan atilmasin.
          if (hata.response?.status === 401) {
            localStorage.removeItem('flowershop_token');
            setKullanici(null);
          }
        })
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
