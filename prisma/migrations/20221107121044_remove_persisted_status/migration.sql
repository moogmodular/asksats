/*
  Warnings:

  - You are about to drop the column `askStatus` on the `Ask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ask" DROP COLUMN "askStatus";

-- DropEnum
DROP TYPE "AskStatus";
