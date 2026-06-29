-- CreateEnum
CREATE TYPE "CourtFacility" AS ENUM ('PARKING', 'TOILET', 'SHOWER', 'CHANGING_ROOM', 'CAFETERIA', 'PRAYER_ROOM', 'OTHER');

-- AlterTable
ALTER TABLE "court" ADD COLUMN "description" TEXT;
ALTER TABLE "court" ADD COLUMN "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "court" ADD COLUMN "facilities" "CourtFacility"[] DEFAULT ARRAY[]::"CourtFacility"[];
