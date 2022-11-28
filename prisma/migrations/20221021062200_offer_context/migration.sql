/*
  Warnings:

  - You are about to drop the column `content` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `obscureMethod` on the `Offer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "content",
DROP COLUMN "fileUrl",
DROP COLUMN "obscureMethod";

-- CreateTable
CREATE TABLE "OfferContext" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT,
    "fileUrl" TEXT[],
    "obscureMethod" TEXT NOT NULL,
    "askId" TEXT,
    "authorId" TEXT,
    "offerId" TEXT NOT NULL,

    CONSTRAINT "OfferContext_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfferContext_offerId_key" ON "OfferContext"("offerId");

-- AddForeignKey
ALTER TABLE "OfferContext" ADD CONSTRAINT "OfferContext_askId_fkey" FOREIGN KEY ("askId") REFERENCES "Ask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferContext" ADD CONSTRAINT "OfferContext_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferContext" ADD CONSTRAINT "OfferContext_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
