-- CreateEnum
CREATE TYPE "AskStatus" AS ENUM ('PENDING', 'CANCELED', 'OVER', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "AskKind" AS ENUM ('PUBLIC', 'BUMP_PUBLIC', 'PRIVATE');

-- CreateTable
CREATE TABLE "Ask" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "deadlineAt" TIMESTAMP(3) NOT NULL,
    "acceptedDeadlineAt" TIMESTAMP(3) NOT NULL,
    "askKind" "AskKind" NOT NULL,
    "askStatus" "AskStatus" NOT NULL,

    CONSTRAINT "Ask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AskContext" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "headerImage" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "askId" TEXT NOT NULL,

    CONSTRAINT "AskContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "obscureMethod" TEXT NOT NULL,
    "askId" TEXT,
    "authorId" TEXT,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bump" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "bidderId" TEXT,
    "askId" TEXT,

    CONSTRAINT "Bump_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AskContext_askId_key" ON "AskContext"("askId");

-- AddForeignKey
ALTER TABLE "Ask" ADD CONSTRAINT "Ask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AskContext" ADD CONSTRAINT "AskContext_askId_fkey" FOREIGN KEY ("askId") REFERENCES "Ask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_askId_fkey" FOREIGN KEY ("askId") REFERENCES "Ask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bump" ADD CONSTRAINT "Bump_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bump" ADD CONSTRAINT "Bump_askId_fkey" FOREIGN KEY ("askId") REFERENCES "Ask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
