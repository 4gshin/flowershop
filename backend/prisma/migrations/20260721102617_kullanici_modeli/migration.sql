-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('KULLANICI', 'ADMIN');

-- CreateTable
CREATE TABLE "kullanicilar" (
    "id" SERIAL NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sifreHash" TEXT NOT NULL,
    "telefon" TEXT,
    "adres" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'KULLANICI',
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kullanicilar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kullanicilar_email_key" ON "kullanicilar"("email");
