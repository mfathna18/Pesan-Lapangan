import { createPaymentAuditRepository } from "@/domains/payment/repositories/payment-audit-repository";
import { createPaymentRepository } from "@/domains/payment/repositories/payment-repository";
import { createManualPaymentService } from "@/domains/payment/services/manual-payment-service";
import { createPaymentService } from "@/domains/payment/services/payment-service";
import { createPaymentBookingWriter } from "@/domains/payment/writers/booking-writer";
import { prisma } from "@/lib/db/prisma";

export function getManualPaymentService() {
  return createManualPaymentService({
    prisma,
    paymentRepository: createPaymentRepository(prisma),
    paymentAuditRepository: createPaymentAuditRepository(prisma),
    paymentService: createPaymentService(prisma),
    bookingWriter: createPaymentBookingWriter(prisma),
  });
}
