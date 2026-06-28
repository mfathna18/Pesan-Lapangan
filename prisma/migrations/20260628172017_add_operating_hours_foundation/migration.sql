-- CreateTable
CREATE TABLE "operating_hours" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operating_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "operating_hours_courtId_idx" ON "operating_hours"("courtId");

-- CreateIndex
CREATE INDEX "operating_hours_courtId_dayOfWeek_idx" ON "operating_hours"("courtId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "operating_hours_courtId_dayOfWeek_isActive_idx" ON "operating_hours"("courtId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE INDEX "operating_hours_courtId_dayOfWeek_startMinute_idx" ON "operating_hours"("courtId", "dayOfWeek", "startMinute");

-- AddForeignKey
ALTER TABLE "operating_hours" ADD CONSTRAINT "operating_hours_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
