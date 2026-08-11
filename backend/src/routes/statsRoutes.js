const express = require('express');
const router = express.Router();
const { istatistikleriGetir } = require('../controllers/statsController');
const girisKontrolu = require('../middleware/auth');
const adminKontrolu = require('../middleware/admin');

router.get('/', girisKontrolu, adminKontrolu, istatistikleriGetir);

module.exports = router;