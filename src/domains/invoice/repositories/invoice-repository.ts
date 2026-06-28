import type {
  CreateInvoiceInput,
  FindInvoiceByPaymentIdInput,
} from "@/domains/invoice/types";
import type {
  Invoice,
  InvoiceStatus,
  PrismaClient,
} from "@/generated/prisma/client";

import { INVOICE_STATUS } from "@/domains/invoice/constants";

export class InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateInvoiceInput): Promise<Invoice> {
    return this.prisma.invoice.create({
      data: {
        paymentId: input.paymentId,
        invoiceNumber: input.invoiceNumber,
        bookingNumberSnapshot: input.bookingNumberSnapshot,
        customerNameSnapshot: input.customerNameSnapshot,
        customerPhoneSnapshot: input.customerPhoneSnapshot,
        gorNameSnapshot: input.gorNameSnapshot,
        courtNameSnapshot: input.courtNameSnapshot,
        bookingDateSnapshot: input.bookingDateSnapshot,
        startMinuteSnapshot: input.startMinuteSnapshot,
        endMinuteSnapshot: input.endMinuteSnapshot,
        totalAmountSnapshot: input.totalAmountSnapshot,
        status: input.status,
        generatedAt: input.generatedAt,
      },
    });
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.prisma.invoice.findUnique({
      where: { id },
    });
  }

  async findByPaymentId(
    input: FindInvoiceByPaymentIdInput,
  ): Promise<Invoice | null> {
    return this.prisma.invoice.findUnique({
      where: { paymentId: input.paymentId },
    });
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    return this.prisma.invoice.findUnique({
      where: { invoiceNumber },
    });
  }

  async voidInvoice(id: string): Promise<Invoice> {
    return this.prisma.invoice.update({
      where: {
        id,
        status: INVOICE_STATUS.GENERATED,
      },
      data: {
        status: INVOICE_STATUS.VOID,
      },
    });
  }
}

export function createInvoiceRepository(
  prisma: PrismaClient,
): InvoiceRepository {
  return new InvoiceRepository(prisma);
}

export type { Invoice, InvoiceStatus };
