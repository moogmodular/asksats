-- DropForeignKey
ALTER TABLE "OfferFilePair" DROP CONSTRAINT "OfferFilePair_offerContextId_fkey";

-- AddForeignKey
ALTER TABLE "OfferFilePair" ADD CONSTRAINT "OfferFilePair_offerContextId_fkey" FOREIGN KEY ("offerContextId") REFERENCES "OfferContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;
