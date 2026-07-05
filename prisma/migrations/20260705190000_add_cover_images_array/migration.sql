-- Migrate single cover URL to cover images array.

ALTER TABLE "gor" ADD COLUMN "coverImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "gor"
SET "coverImages" = ARRAY["coverImageUrl"]
WHERE "coverImageUrl" IS NOT NULL AND "coverImageUrl" <> '';

ALTER TABLE "gor" DROP COLUMN "coverImageUrl";
