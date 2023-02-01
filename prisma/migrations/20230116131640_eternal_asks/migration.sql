/*
  Warnings:

  - You are about to drop the column `acceptedDeadlineAt` on the `Ask` table. All the data in the column will be lost.
  - You are about to drop the column `deadlineAt` on the `Ask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ask" DROP COLUMN "acceptedDeadlineAt",
DROP COLUMN "deadlineAt";
