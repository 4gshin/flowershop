-- CreateEnum
CREATE TYPE "SiparisDurumu" AS ENUM ('ALINDI', 'HAZIRLANIYOR', 'YOLDA', 'TESLIM_EDILDI', 'IPTAL');

-- CreateTable
CREATE TABLE "siparisler" (
    "id" SERIAL NOT NULL,
    "kullaniciId" INTEGER NOT NULL,
    "teslimatBolgesiId" INTEGER NOT NULL,
    "teslimatAdresi" TEXT NOT NULL,
    "aliciAdSoyad" TEXT NOT NULL,
    "aliciTelefon" TEXT NOT NULL,
    "urunToplami" DECIMAL(10,2) NOT NULL,
    "teslimatUcreti" DECIMAL(10,2) NOT NULL,
    "genelToplam" DECIMAL(10,2) NOT NULL,
    "durum" "SiparisDurumu" NOT NULL DEFAULT 'ALINDI',
    "not" TEXT,
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "siparisler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siparis_kalemleri" (
    "id" SERIAL NOT NULL,
    "siparisId" INTEGER NOT NULL,
    "urunId" INTEGER NOT NULL,
    "adet" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "siparis_kalemleri_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "kullanicilar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_teslimatBolgesiId_fkey" FOREIGN KEY ("teslimatBolgesiId") REFERENCES "teslimat_bolgeleri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_kalemleri" ADD CONSTRAINT "siparis_kalemleri_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "siparisler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siparis_kalemleri" ADD CONSTRAINT "siparis_kalemleri_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "urunler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
