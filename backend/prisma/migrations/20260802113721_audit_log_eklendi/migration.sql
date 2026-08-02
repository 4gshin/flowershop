-- CreateTable
CREATE TABLE "audit_loglari" (
    "id" SERIAL NOT NULL,
    "kullaniciId" INTEGER,
    "kullaniciEmail" TEXT,
    "islem" TEXT NOT NULL,
    "hedefTur" TEXT,
    "hedefId" INTEGER,
    "detay" TEXT,
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_loglari_pkey" PRIMARY KEY ("id")
);
