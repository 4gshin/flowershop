const express = require('express');
const router = express.Router();
const { kayitOl, girisYap } = require('../controllers/authController');

router.post('/kayit', kayitOl);
router.post('/giris', girisYap);

module.exports = router;