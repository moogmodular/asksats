/*
  Warnings:

  - You are about to drop the column `askId` on the `OfferContext` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `OfferContext` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `AskContext` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `AskContext` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OfferContext" DROP CONSTRAINT "OfferContext_askId_fkey";

-- DropForeignKey
ALTER TABLE "OfferContext" DROP CONSTRAINT "OfferContext_authorId_fkey";

-- AlterTable
ALTER TABLE "AskContext" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OfferContext" DROP COLUMN "askId",
DROP COLUMN "authorId";

-- CreateIndex
CREATE UNIQUE INDEX "AskContext_slug_key" ON "AskContext"("slug");
