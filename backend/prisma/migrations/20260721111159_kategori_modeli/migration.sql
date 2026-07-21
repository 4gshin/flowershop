-- CreateTable
CREATE TABLE "kategoriler" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,

    CONSTRAINT "kategoriler_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kategoriler_ad_key" ON "kategoriler"("ad");
