-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
  'BOOKING_CREATED',
  'PAYMENT_AWAITING_CONFIRMATION',
  'PAYMENT_APPROVED',
  'PAYMENT_REJECTED',
  'BOOKING_CANCELLED',
  'SUBSCRIPTION_EXPIRING',
  'SUBSCRIPTION_ACTIVATED'
);

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('BOOKING', 'PAYMENT', 'SYSTEM');

-- CreateTable
CREATE TABLE "owner_notification" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "href" TEXT,
    "bookingId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "owner_notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "owner_notification_ownerId_createdAt_idx" ON "owner_notification"("ownerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "owner_notification_ownerId_readAt_idx" ON "owner_notification"("ownerId", "readAt");

-- AddForeignKey
ALTER TABLE "owner_notification" ADD CONSTRAINT "owner_notification_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
