-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'GRACE_PERIOD', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'STARTER', 'PRO');

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "graceUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_ownerId_key" ON "subscription"("ownerId");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill default subscriptions for existing owners
INSERT INTO "subscription" ("id", "ownerId", "plan", "status", "startsAt", "expiresAt", "graceUntil", "createdAt", "updatedAt")
SELECT
    concat('sub_', "id"),
    "id",
    'FREE',
    'TRIAL',
    CURRENT_TIMESTAMP,
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "owner"
WHERE "id" NOT IN (SELECT "ownerId" FROM "subscription");
