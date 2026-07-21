require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const deliveryZoneRoutes = require('./routes/deliveryZoneRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/kategoriler', categoryRoutes);
app.use('/api/urunler', productRoutes);
app.use('/api/teslimat-bolgeleri', deliveryZoneRoutes);

app.get('/api/durum', (req, res) => {
  res.json({ durum: 'calisiyor', mesaj: 'FlowerShop API aktif.' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`FlowerShop API ${PORT} portunda calisiyor.`);
});