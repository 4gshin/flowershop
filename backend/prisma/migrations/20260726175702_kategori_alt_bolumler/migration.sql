-- AlterTable
ALTER TABLE "kategoriler" ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "kategoriler" ADD CONSTRAINT "kategoriler_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "kategoriler"("id") ON DELETE SET NULL ON UPDATE CASCADE;
