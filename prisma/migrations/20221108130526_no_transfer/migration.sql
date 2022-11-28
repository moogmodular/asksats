/*
  Warnings:

  - The values [TRANSFER] on the enum `TransactionKind` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionKind_new" AS ENUM ('INVOICE', 'WITHDRAWAL');
ALTER TABLE "Transaction" ALTER COLUMN "transactionKind" TYPE "TransactionKind_new" USING ("transactionKind"::text::"TransactionKind_new");
ALTER TYPE "TransactionKind" RENAME TO "TransactionKind_old";
ALTER TYPE "TransactionKind_new" RENAME TO "TransactionKind";
DROP TYPE "TransactionKind_old";
COMMIT;
