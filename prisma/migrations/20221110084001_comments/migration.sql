/*
  Warnings:

  - Changed the type of `askKind` on the `Ask` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `transactionKind` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `transactionStatus` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Ask" DROP COLUMN "askKind",
ADD COLUMN     "askKind" "AskKind" NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "transactionKind",
ADD COLUMN     "transactionKind" "TransactionKind" NOT NULL,
DROP COLUMN "transactionStatus",
ADD COLUMN     "transactionStatus" "TransactionStatus" NOT NULL;

-- CreateTable
CREATE TABLE "AskComment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT,
    "parentId" TEXT,
    "askId" TEXT,

    CONSTRAINT "AskComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AskComment" ADD CONSTRAINT "AskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AskComment" ADD CONSTRAINT "AskComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AskComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AskComment" ADD CONSTRAINT "AskComment_askId_fkey" FOREIGN KEY ("askId") REFERENCES "Ask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
