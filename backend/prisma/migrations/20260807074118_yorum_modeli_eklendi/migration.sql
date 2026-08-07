-- CreateTable
CREATE TABLE "yorumlar" (
    "id" SERIAL NOT NULL,
    "puan" INTEGER NOT NULL,
    "yorum" TEXT,
    "kullaniciAd" TEXT NOT NULL,
    "kullaniciId" INTEGER,
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "urunId" INTEGER NOT NULL,

    CONSTRAINT "yorumlar_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "yorumlar" ADD CONSTRAINT "yorumlar_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "kullanicilar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yorumlar" ADD CONSTRAINT "yorumlar_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "urunler"("id") ON DELETE CASCADE ON UPDATE CASCADE;
