import { createPaymentService } from "@/domains/payment/services/payment-service";
import { prisma } from "@/lib/db/prisma";

export function getPaymentService() {
  return createPaymentService(prisma);
}
