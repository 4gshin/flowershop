const express = require('express');
const router = express.Router();
const {
  kuponlariListele,
  kuponEkle,
  kuponDurumDegistir,
  kuponSil,
  kuponDogrula
} = require('../controllers/kuponController');
const girisKontrolu = require('../middleware/auth');
const adminKontrolu = require('../middleware/admin');

// Musteri: kupon dogrula (giris yapmis olmali)
router.post('/dogrula', girisKontrolu, kuponDogrula);

// Admin: yonetim islemleri
router.get('/', girisKontrolu, adminKontrolu, kuponlariListele);
router.post('/', girisKontrolu, adminKontrolu, kuponEkle);
router.patch('/:id/durum', girisKontrolu, adminKontrolu, kuponDurumDegistir);
router.delete('/:id', girisKontrolu, adminKontrolu, kuponSil);

module.exports = router;