const express = require('express');
const router = express.Router();
const { kategorileriListele, kategoriEkle, kategoriSil } = require('../controllers/categoryController');
const girisKontrolu = require('../middleware/auth');
const adminKontrolu = require('../middleware/admin');

router.get('/', kategorileriListele);
router.post('/', girisKontrolu, adminKontrolu, kategoriEkle);
router.delete('/:id', girisKontrolu, adminKontrolu, kategoriSil);

module.exports = router;