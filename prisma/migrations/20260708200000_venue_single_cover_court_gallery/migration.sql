-- Sprint: venue cover becomes a single image; court gallery remains on court.imageUrls.
-- Preserve existing primary cover when converting from coverImages[].

ALTER TABLE "gor" ADD COLUMN "coverImageUrl" TEXT;

UPDATE "gor"
SET "coverImageUrl" = "coverImages"[1]
WHERE cardinality("coverImages") >= 1;

ALTER TABLE "gor" DROP COLUMN "coverImages";
