/*
  Warnings:

  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TagsOnAsks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TagToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TagsOnAsks" DROP CONSTRAINT "TagsOnAsks_askId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnAsks" DROP CONSTRAINT "TagsOnAsks_tagId_fkey";

-- DropForeignKey
ALTER TABLE "_TagToUser" DROP CONSTRAINT "_TagToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_TagToUser" DROP CONSTRAINT "_TagToUser_B_fkey";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "TagsOnAsks";

-- DropTable
DROP TABLE "_TagToUser";
