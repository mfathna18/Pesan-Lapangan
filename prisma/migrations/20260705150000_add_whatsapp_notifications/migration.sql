-- CreateEnum
CREATE TYPE "WhatsAppMessageStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'RETRYING');

-- CreateEnum
CREATE TYPE "WhatsAppRecipientType" AS ENUM ('OWNER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "WhatsAppMessageType" AS ENUM (
  'OWNER_NEW_BOOKING',
  'OWNER_PAYMENT_AWAITING',
  'OWNER_BOOKING_CANCELLED',
  'CUSTOMER_BOOKING_CREATED',
  'CUSTOMER_PAYMENT_APPROVED',
  'CUSTOMER_PAYMENT_REJECTED',
  'CUSTOMER_BOOKING_REMINDER',
  'OWNER_SUBSCRIPTION_ACTIVATED'
);

-- CreateTable
CREATE TABLE "owner_whatsapp_settings" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "notifyBooking" BOOLEAN NOT NULL DEFAULT true,
  "notifyPayment" BOOLEAN NOT NULL DEFAULT true,
  "notifyReminder" BOOLEAN NOT NULL DEFAULT true,
  "notifySubscription" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "owner_whatsapp_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_message_log" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT,
  "bookingId" TEXT,
  "recipientPhone" TEXT NOT NULL,
  "recipientType" "WhatsAppRecipientType" NOT NULL,
  "messageType" "WhatsAppMessageType" NOT NULL,
  "messageBody" TEXT NOT NULL,
  "status" "WhatsAppMessageStatus" NOT NULL DEFAULT 'PENDING',
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "providerName" TEXT,
  "providerResponse" TEXT,
  "errorMessage" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "whatsapp_message_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "owner_whatsapp_settings_ownerId_key" ON "owner_whatsapp_settings"("ownerId");

-- CreateIndex
CREATE INDEX "whatsapp_message_log_bookingId_messageType_status_idx" ON "whatsapp_message_log"("bookingId", "messageType", "status");

-- CreateIndex
CREATE INDEX "whatsapp_message_log_ownerId_createdAt_idx" ON "whatsapp_message_log"("ownerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "whatsapp_message_log_status_attemptCount_idx" ON "whatsapp_message_log"("status", "attemptCount");

-- AddForeignKey
ALTER TABLE "owner_whatsapp_settings" ADD CONSTRAINT "owner_whatsapp_settings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_message_log" ADD CONSTRAINT "whatsapp_message_log_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
