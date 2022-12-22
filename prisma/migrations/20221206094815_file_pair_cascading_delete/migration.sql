-- DropForeignKey
ALTER TABLE "OfferFilePair" DROP CONSTRAINT "OfferFilePair_obscureFileId_fkey";

-- DropForeignKey
ALTER TABLE "OfferFilePair" DROP CONSTRAINT "OfferFilePair_offerFileId_fkey";

-- AddForeignKey
ALTER TABLE "OfferFilePair" ADD CONSTRAINT "OfferFilePair_offerFileId_fkey" FOREIGN KEY ("offerFileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferFilePair" ADD CONSTRAINT "OfferFilePair_obscureFileId_fkey" FOREIGN KEY ("obscureFileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
