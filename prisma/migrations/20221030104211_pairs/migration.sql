/*
  Warnings:

  - You are about to drop the column `offerContextId` on the `File` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_offerContextId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "offerContextId";

-- CreateTable
CREATE TABLE "OfferFilePair" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT NOT NULL,
    "offerFileId" TEXT NOT NULL,
    "obscureFileId" TEXT NOT NULL,
    "offerContextId" TEXT,

    CONSTRAINT "OfferFilePair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfferFilePair_offerFileId_key" ON "OfferFilePair"("offerFileId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferFilePair_obscureFileId_key" ON "OfferFilePair"("obscureFileId");

-- AddForeignKey
ALTER TABLE "OfferFilePair" ADD CONSTRAINT "OfferFilePair_offerFileId_fkey" FOREIGN KEY ("offerFileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferFilePair" ADD CONSTRAINT "OfferFilePair_obscureFileId_fkey" FOREIGN KEY ("obscureFileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferFilePair" ADD CONSTRAINT "OfferFilePair_offerContextId_fkey" FOREIGN KEY ("offerContextId") REFERENCES "OfferContext"("id") ON DELETE SET NULL ON UPDATE CASCADE;
