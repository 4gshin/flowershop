// Urun gorsellerinin Cloudinary'ye yuklenmesi icin multer ayarlari
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const depolamaAyari = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'flowershop', // Cloudinary hesabinda "flowershop" adli klasorde saklanir
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

const upload = multer({ storage: depolamaAyari });

module.exports = upload;