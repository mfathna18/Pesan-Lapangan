-- CreateEnum
CREATE TYPE "SubscriptionBillingAction" AS ENUM ('UPGRADE', 'RENEW');

-- CreateTable
CREATE TABLE "subscription_payment" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'MIDTRANS',
    "targetPlan" "SubscriptionPlan" NOT NULL,
    "billingAction" "SubscriptionBillingAction" NOT NULL,
    "externalReference" TEXT,
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subscription_payment_subscriptionId_idx" ON "subscription_payment"("subscriptionId");

-- CreateIndex
CREATE INDEX "subscription_payment_subscriptionId_status_idx" ON "subscription_payment"("subscriptionId", "status");

-- CreateIndex
CREATE INDEX "subscription_payment_externalReference_idx" ON "subscription_payment"("externalReference");

-- AddForeignKey
ALTER TABLE "subscription_payment" ADD CONSTRAINT "subscription_payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
