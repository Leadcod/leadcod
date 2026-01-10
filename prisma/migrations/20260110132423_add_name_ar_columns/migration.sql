/*
  Warnings:

  - Added the required column `nameAr` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameAr` to the `State` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "City" ADD COLUMN     "nameAr" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "State" ADD COLUMN     "nameAr" TEXT NOT NULL;
