/*
  Warnings:

  - A unique constraint covering the columns `[favouritedById]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "favouritedById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Offer_favouritedById_key" ON "Offer"("favouritedById");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_favouritedById_fkey" FOREIGN KEY ("favouritedById") REFERENCES "Ask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
