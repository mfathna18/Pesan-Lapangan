-- CreateTable
CREATE TABLE "price_rule" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_rule_courtId_idx" ON "price_rule"("courtId");

-- CreateIndex
CREATE INDEX "price_rule_courtId_dayOfWeek_idx" ON "price_rule"("courtId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "price_rule_courtId_dayOfWeek_isActive_idx" ON "price_rule"("courtId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE INDEX "price_rule_courtId_dayOfWeek_startMinute_idx" ON "price_rule"("courtId", "dayOfWeek", "startMinute");

-- AddForeignKey
ALTER TABLE "price_rule" ADD CONSTRAINT "price_rule_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
