/*
  Warnings:

  - Added the required column `photoUrl` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailURL` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "photoUrl" TEXT NOT NULL,
ADD COLUMN     "thumbnailURL" TEXT NOT NULL;
