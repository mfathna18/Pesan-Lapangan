import { createInvoiceRepository } from "@/domains/invoice/repositories/invoice-repository";
import { createPublicInvoiceService } from "@/domains/invoice/services/public-invoice-service";
import { prisma } from "@/lib/db/prisma";

export function getPublicInvoiceService() {
  return createPublicInvoiceService({
    invoiceRepository: createInvoiceRepository(prisma),
  });
}
