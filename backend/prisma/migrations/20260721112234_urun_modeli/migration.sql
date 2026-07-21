-- CreateTable
CREATE TABLE "urunler" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "fiyat" DECIMAL(10,2) NOT NULL,
    "stokAdedi" INTEGER NOT NULL DEFAULT 0,
    "gorselUrl" TEXT,
    "kategoriId" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "urunler_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "urunler" ADD CONSTRAINT "urunler_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "kategoriler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
