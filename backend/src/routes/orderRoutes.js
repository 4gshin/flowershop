const express = require('express');
const router = express.Router();
const {
  siparisOlustur,
  kendiSiparislerimGetir,
  tumSiparisleriListele,
  siparisDurumGuncelle
} = require('../controllers/orderController');
const girisKontrolu = require('../middleware/auth');
const adminKontrolu = require('../middleware/admin');

router.post('/', girisKontrolu, siparisOlustur);
router.get('/benim-siparislerim', girisKontrolu, kendiSiparislerimGetir);
router.get('/tumu', girisKontrolu, adminKontrolu, tumSiparisleriListele);
router.put('/:id/durum', girisKontrolu, adminKontrolu, siparisDurumGuncelle);

module.exports = router;