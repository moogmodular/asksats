/*
  Warnings:

  - You are about to drop the column `headerImage` on the `AskContext` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `OfferContext` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[headerImageId]` on the table `AskContext` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AskContext" DROP COLUMN "headerImage",
ADD COLUMN     "headerImageId" TEXT;

-- AlterTable
ALTER TABLE "OfferContext" DROP COLUMN "fileUrl";

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "offerContextId" TEXT,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_url_key" ON "File"("url");

-- CreateIndex
CREATE UNIQUE INDEX "AskContext_headerImageId_key" ON "AskContext"("headerImageId");

-- AddForeignKey
ALTER TABLE "AskContext" ADD CONSTRAINT "AskContext_headerImageId_fkey" FOREIGN KEY ("headerImageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_offerContextId_fkey" FOREIGN KEY ("offerContextId") REFERENCES "OfferContext"("id") ON DELETE SET NULL ON UPDATE CASCADE;
