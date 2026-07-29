// Sadece giris yapmis (ve istege gore admin) kullanicilarin erisebilecegi sayfalar icin koruma bileseni
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function QorunanRota({ children, sadeceAdmin = false }) {
  const { kullanici, yukleniyor } = useAuth();

  if (yukleniyor) {
    return <p className="text-center py-24 text-charcoal/50">Yükleniyor...</p>;
  }

  if (!kullanici) {
    return <Navigate to="/giris" replace />;
  }

  if (sadeceAdmin && kullanici.rol !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default QorunanRota;
