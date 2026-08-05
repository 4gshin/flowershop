// FlowerShop backend API - ana giris dosyasi
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const selfPingBaslat = require('./utils/selfPing');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const deliveryZoneRoutes = require('./routes/deliveryZoneRoutes');
const orderRoutes = require('./routes/orderRoutes');
// 1. Audit Log Route faylını import edirik:
const auditLogRoutes = require('./routes/auditLogRoutes'); // <-- Faylın adı tam belədirsə

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));

app.use(express.json());
const { authLimiter, genelLimiter } = require('./middleware/rateLimit');
app.use('/api/auth', authLimiter);
app.use('/api', genelLimiter);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/kategoriler', categoryRoutes);
app.use('/api/urunler', productRoutes);
app.use('/api/teslimat-bolgeleri', deliveryZoneRoutes);
app.use('/api/siparisler', orderRoutes);
// 2. Audit Log endpoint-ini serverə tanıtdırırıq:
app.use('/api/audit-logs', auditLogRoutes); // <-- BURAYA ƏLAVƏ OLUNDU

app.get('/api/durum', (req, res) => {
  res.json({ durum: 'calisiyor', mesaj: 'FlowerShop API aktif.' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`FlowerShop API ${PORT} portunda calisiyor.`);
  selfPingBaslat();
});