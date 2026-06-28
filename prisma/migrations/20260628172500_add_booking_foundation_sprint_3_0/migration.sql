-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "bookingNumber" TEXT NOT NULL,
ADD COLUMN     "courtNameSnapshot" TEXT NOT NULL,
ADD COLUMN     "durationMinute" INTEGER NOT NULL,
ADD COLUMN     "gorNameSnapshot" TEXT NOT NULL,
ADD COLUMN     "pricePerHourSnapshot" INTEGER NOT NULL,
ADD COLUMN     "sportTypeSnapshot" TEXT NOT NULL,
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "totalPrice" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "booking_contact" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_contact_bookingId_key" ON "booking_contact"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_bookingNumber_key" ON "booking"("bookingNumber");

-- CreateIndex
CREATE INDEX "booking_courtId_bookingDate_status_idx" ON "booking"("courtId", "bookingDate", "status");

-- CreateIndex
CREATE INDEX "booking_bookingDate_startMinute_idx" ON "booking"("bookingDate", "startMinute");

-- AddForeignKey
ALTER TABLE "booking_contact" ADD CONSTRAINT "booking_contact_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
