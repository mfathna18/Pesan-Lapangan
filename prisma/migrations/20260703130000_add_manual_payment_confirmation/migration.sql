-- Manual payment confirmation (Sprint 19)

ALTER TABLE "gor" ADD COLUMN "bankName" TEXT;
ALTER TABLE "gor" ADD COLUMN "bankAccountNumber" TEXT;
ALTER TABLE "gor" ADD COLUMN "bankAccountHolder" TEXT;
ALTER TABLE "gor" ADD COLUMN "qrisImageUrl" TEXT;

ALTER TYPE "PaymentStatus" ADD VALUE 'AWAITING_CONFIRMATION';
ALTER TYPE "PaymentStatus" ADD VALUE 'REJECTED';

ALTER TYPE "PaymentMethod" ADD VALUE 'MANUAL_TRANSFER';

ALTER TABLE "payment" ADD COLUMN "customerConfirmedAt" TIMESTAMP(3);
ALTER TABLE "payment" ADD COLUMN "approvedByUserId" TEXT;
ALTER TABLE "payment" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "payment" ADD COLUMN "rejectedByUserId" TEXT;
ALTER TABLE "payment" ADD COLUMN "rejectedAt" TIMESTAMP(3);
ALTER TABLE "payment" ADD COLUMN "rejectionReason" TEXT;

CREATE TYPE "PaymentConfirmationAction" AS ENUM (
  'CREATED',
  'CUSTOMER_CONFIRMED',
  'APPROVED',
  'REJECTED',
  'CANCELLED'
);

CREATE TABLE "payment_confirmation_audit_log" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "action" "PaymentConfirmationAction" NOT NULL,
  "fromStatus" "PaymentStatus",
  "toStatus" "PaymentStatus",
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payment_confirmation_audit_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payment_confirmation_audit_log_paymentId_idx" ON "payment_confirmation_audit_log"("paymentId");
CREATE INDEX "payment_confirmation_audit_log_createdAt_idx" ON "payment_confirmation_audit_log"("createdAt");
CREATE INDEX "payment_status_customerConfirmedAt_idx" ON "payment"("status", "customerConfirmedAt");

ALTER TABLE "payment_confirmation_audit_log"
  ADD CONSTRAINT "payment_confirmation_audit_log_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
