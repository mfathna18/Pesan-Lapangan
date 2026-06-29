-- AlterTable
ALTER TABLE "gor" ADD COLUMN "name" TEXT NOT NULL DEFAULT 'GOR Olahraga';
ALTER TABLE "gor" ADD COLUMN "slug" TEXT;
ALTER TABLE "gor" ADD COLUMN "address" TEXT NOT NULL DEFAULT '';
ALTER TABLE "gor" ADD COLUMN "description" TEXT;

-- Backfill slug for existing rows
UPDATE "gor" SET "slug" = "id" WHERE "slug" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "gor_slug_key" ON "gor"("slug");

-- Set slug NOT NULL after backfill
ALTER TABLE "gor" ALTER COLUMN "slug" SET NOT NULL;
