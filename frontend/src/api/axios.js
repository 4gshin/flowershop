// Tum API isteklerinde kullanilacak ortak axios ornegi
// Kullanicinin token bilgisi otomatik olarak istek basligina eklenir
import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flowershop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;