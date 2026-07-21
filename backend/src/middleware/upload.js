// Urun gorsellerinin sunucuya yuklenmesi icin multer ayarlari
const multer = require('multer');
const path = require('path');

const depolamaAyari = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const benzersizIsim = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, benzersizIsim);
  }
});

const dosyaFiltresi = (req, file, cb) => {
  const izinVerilenTipler = ['image/jpeg', 'image/png', 'image/webp'];
  if (izinVerilenTipler.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece jpeg, png veya webp formatinda gorsel yuklenebilir.'));
  }
};

const upload = multer({ storage: depolamaAyari, fileFilter: dosyaFiltresi });

module.exports = upload;