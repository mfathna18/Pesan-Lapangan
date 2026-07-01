import { createInvoiceRepository } from "@/domains/invoice/repositories/invoice-repository";
import { createOwnerInvoiceService } from "@/domains/invoice/services/owner-invoice-service";
import { prisma } from "@/lib/db/prisma";

export function getOwnerInvoiceService() {
  return createOwnerInvoiceService({
    invoiceRepository: createInvoiceRepository(prisma),
  });
}
