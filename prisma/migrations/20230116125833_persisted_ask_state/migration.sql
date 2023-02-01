/*
  Warnings:

  - Added the required column `askStatus` to the `Ask` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AskStatus" AS ENUM ('OPEN', 'SETTLED', 'CANCELED');

-- AlterTable
ALTER TABLE "Ask" ADD COLUMN     "askStatus" "AskStatus" NOT NULL;
