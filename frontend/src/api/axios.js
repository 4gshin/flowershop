// Tum API isteklerinde kullanilacak ortak axios ornegi
// Kullanicinin token bilgisi otomatik olarak istek basligina eklenir
import axios from 'axios';

// Gelistirme ortaminda (VITE_API_URL tanimli degilse) '/api' kullanilir,
// bu da vite.config.js'deki proxy sayesinde backend'e yonlendirilir.
// Production'da VITE_API_URL degiskeni gercek backend adresini icerir.
const API_TABAN_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_TABAN_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flowershop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;