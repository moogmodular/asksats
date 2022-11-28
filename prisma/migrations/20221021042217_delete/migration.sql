-- DropForeignKey
ALTER TABLE "AskContext" DROP CONSTRAINT "AskContext_askId_fkey";

-- AddForeignKey
ALTER TABLE "AskContext" ADD CONSTRAINT "AskContext_askId_fkey" FOREIGN KEY ("askId") REFERENCES "Ask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
