-- AlterTable
ALTER TABLE "OfferFilePair" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "OfferFilePair" ADD CONSTRAINT "OfferFilePair_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
