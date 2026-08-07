const express = require('express');
const router = express.Router();
const {
  urunleriListele,
  urunDetayGetir,
  urunEkle,
  urunGuncelle,
  urunSil,
  enCokSatilanlar
} = require('../controllers/productController');
const girisKontrolu = require('../middleware/auth');
const adminKontrolu = require('../middleware/admin');
const upload = require('../middleware/upload');

// DIKKAT: /en-cok-satilanlar rotasi /:id'den ONCE tanimlanmali,
// yoksa "en-cok-satilanlar" bir id olarak algilanir ve hata verir
router.get('/en-cok-satilanlar', enCokSatilanlar);

router.get('/', urunleriListele);
router.get('/:id', urunDetayGetir);

router.post('/', girisKontrolu, adminKontrolu, upload.single('gorsel'), urunEkle);
router.put('/:id', girisKontrolu, adminKontrolu, upload.single('gorsel'), urunGuncelle);
router.delete('/:id', girisKontrolu, adminKontrolu, urunSil);

module.exports = router;