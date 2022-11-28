-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "BlogItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "userId" TEXT,
    "parentId" TEXT,

    CONSTRAINT "BlogItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BlogItem" ADD CONSTRAINT "BlogItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogItem" ADD CONSTRAINT "BlogItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BlogItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
