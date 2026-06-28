-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "bookingDate" DATE NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_courtId_bookingDate_idx" ON "booking"("courtId", "bookingDate");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
