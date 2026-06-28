/*
  Warnings:

  - Added the required column `name` to the `court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sportType` to the `court` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('BADMINTON', 'FUTSAL', 'BASKETBALL', 'VOLLEYBALL', 'TENNIS', 'OTHER');

-- AlterTable
ALTER TABLE "court" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "sportType" "SportType" NOT NULL;

-- CreateIndex
CREATE INDEX "court_gorId_displayOrder_idx" ON "court"("gorId", "displayOrder");

-- CreateIndex
CREATE INDEX "court_gorId_isActive_idx" ON "court"("gorId", "isActive");
