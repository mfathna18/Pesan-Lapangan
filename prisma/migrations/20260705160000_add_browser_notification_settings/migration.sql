-- CreateTable
CREATE TABLE "owner_browser_notification_settings" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "notifyBooking" BOOLEAN NOT NULL DEFAULT true,
  "notifyPayment" BOOLEAN NOT NULL DEFAULT true,
  "notifyReminder" BOOLEAN NOT NULL DEFAULT true,
  "notifySubscription" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "owner_browser_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "owner_browser_notification_settings_ownerId_key" ON "owner_browser_notification_settings"("ownerId");

-- AddForeignKey
ALTER TABLE "owner_browser_notification_settings" ADD CONSTRAINT "owner_browser_notification_settings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
