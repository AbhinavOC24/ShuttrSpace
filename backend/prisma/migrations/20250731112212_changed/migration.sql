/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `Photo` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "photoUrl",
ADD COLUMN     "imageUrl" TEXT NOT NULL;
