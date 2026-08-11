const express = require('express');
const router = express.Router();
const { auditLoglariListele } = require('../controllers/auditLogController');
const girisKontrolu = require('../middleware/auth');
const adminKontrolu = require('../middleware/admin');

router.get('/', girisKontrolu, adminKontrolu, auditLoglariListele);

module.exports = router;