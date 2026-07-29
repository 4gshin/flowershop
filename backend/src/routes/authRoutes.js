const express = require('express');
const router = express.Router();
const { kayitOl, girisYap, profilGetir } = require('../controllers/authController');
const girisKontrolu = require('../middleware/auth');

router.post('/kayit', kayitOl);
router.post('/giris', girisYap);
router.get('/profil', girisKontrolu, profilGetir);

module.exports = router;
