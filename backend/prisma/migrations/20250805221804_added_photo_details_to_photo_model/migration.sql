/*
  Warnings:

  - Added the required column `aperture` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cameraname` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iso` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lens` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shutterspeed` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "aperture" TEXT NOT NULL,
ADD COLUMN     "cameraname" TEXT NOT NULL,
ADD COLUMN     "iso" TEXT NOT NULL,
ADD COLUMN     "lens" TEXT NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "shutterspeed" TEXT NOT NULL;
