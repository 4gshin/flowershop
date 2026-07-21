const express = require('express');
const router = express.Router();
const {
  bolgeleriListele,
  bolgeEkle,
  bolgeGuncelle,
  bolgeSil
} = require('../controllers/deliveryZoneController');
const girisKontrolu = require('../middleware/auth');
const adminKontrolu = require('../middleware/admin');

router.get('/', bolgeleriListele);
router.post('/', girisKontrolu, adminKontrolu, bolgeEkle);
router.put('/:id', girisKontrolu, adminKontrolu, bolgeGuncelle);
router.delete('/:id', girisKontrolu, adminKontrolu, bolgeSil);

module.exports = router;