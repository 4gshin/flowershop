-- CreateTable
CREATE TABLE "teslimat_bolgeleri" (
    "id" SERIAL NOT NULL,
    "bolgeAdi" TEXT NOT NULL,
    "teslimatUcreti" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "teslimat_bolgeleri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teslimat_bolgeleri_bolgeAdi_key" ON "teslimat_bolgeleri"("bolgeAdi");
