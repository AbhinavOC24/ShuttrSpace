/*
  Warnings:

  - Added the required column `metadataCid` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signature` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "metadataCid" TEXT NOT NULL,
ADD COLUMN     "signature" TEXT NOT NULL;
