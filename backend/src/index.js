require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Sunucunun ayakta oldugunu kontrol etmek icin basit bir uc nokta
app.get('/api/durum', (req, res) => {
  res.json({ durum: 'calisiyor', mesaj: 'FlowerShop API aktif.' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`FlowerShop API ${PORT} portunda calisiyor.`);
});