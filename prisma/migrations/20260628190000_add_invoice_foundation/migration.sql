-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('GENERATED', 'VOID');

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "bookingNumberSnapshot" TEXT NOT NULL,
    "customerNameSnapshot" TEXT NOT NULL,
    "customerPhoneSnapshot" TEXT NOT NULL,
    "gorNameSnapshot" TEXT NOT NULL,
    "courtNameSnapshot" TEXT NOT NULL,
    "bookingDateSnapshot" DATE NOT NULL,
    "startMinuteSnapshot" INTEGER NOT NULL,
    "endMinuteSnapshot" INTEGER NOT NULL,
    "totalAmountSnapshot" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'GENERATED',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoice_paymentId_key" ON "invoice"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNumber_key" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoice_status_idx" ON "invoice"("status");

-- CreateIndex
CREATE INDEX "invoice_generatedAt_idx" ON "invoice"("generatedAt");

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
