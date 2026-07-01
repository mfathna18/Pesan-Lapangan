-- AlterTable
ALTER TABLE "booking" ADD COLUMN "expiresAt" TIMESTAMP(3);

UPDATE "booking"
SET "expiresAt" = "createdAt" + INTERVAL '5 minutes'
WHERE "expiresAt" IS NULL;

ALTER TABLE "booking" ALTER COLUMN "expiresAt" SET NOT NULL;

CREATE INDEX "booking_status_expiresAt_idx" ON "booking"("status", "expiresAt");
