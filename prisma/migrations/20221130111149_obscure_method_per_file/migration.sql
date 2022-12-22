/*
  Warnings:

  - You are about to drop the column `obscureMethod` on the `OfferContext` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OfferContext" DROP COLUMN "obscureMethod";

-- AlterTable
ALTER TABLE "OfferFilePair" ADD COLUMN     "obscureMethod" TEXT NOT NULL DEFAULT 'BLUR';
