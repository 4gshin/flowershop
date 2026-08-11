-- CreateEnum
CREATE TYPE "EndirimTuru" AS ENUM ('YUZDE', 'SABIT');

-- AlterTable
ALTER TABLE "siparisler" ADD COLUMN     "endirimTutari" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "kuponId" INTEGER;

-- CreateTable
CREATE TABLE "kuponlar" (
    "id" SERIAL NOT NULL,
    "kod" TEXT NOT NULL,
    "aciklama" TEXT,
    "endirimTuru" "EndirimTuru" NOT NULL,
    "endirimDeger" DECIMAL(10,2) NOT NULL,
    "minSiparisTutari" DECIMAL(10,2),
    "kullanimLimiti" INTEGER,
    "kullanimSayisi" INTEGER NOT NULL DEFAULT 0,
    "gecerlilikTarihi" TIMESTAMP(3),
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kuponlar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kuponlar_kod_key" ON "kuponlar"("kod");

-- AddForeignKey
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_kuponId_fkey" FOREIGN KEY ("kuponId") REFERENCES "kuponlar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
