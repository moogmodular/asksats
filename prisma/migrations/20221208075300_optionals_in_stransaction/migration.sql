-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "hash" DROP NOT NULL,
ALTER COLUMN "bolt11" DROP NOT NULL,
ALTER COLUMN "lndId" DROP NOT NULL,
ALTER COLUMN "mSatsTarget" DROP NOT NULL;
