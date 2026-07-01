import type {
  CreateInvoiceInput,
  FindInvoiceByPaymentIdInput,
  ListOwnerInvoicesInput,
} from "@/domains/invoice/types";
import type {
  Invoice,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  PrismaClient,
} from "@/generated/prisma/client";

import { INVOICE_STATUS } from "@/domains/invoice/constants";
import type { InvoiceWithPaymentSnapshot } from "@/domains/invoice/pdf/invoice-pdf-mapper";
import { PAYMENT_STATUS } from "@/domains/payment/constants";

const ownerInvoicePaymentSelect = {
  method: true,
  status: true,
  externalReference: true,
  paidAt: true,
  bookingId: true,
} as const;

export type OwnerInvoiceRecord = Invoice & {
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    externalReference: string | null;
    paidAt: Date | null;
    bookingId: string;
  };
};

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

  async findPublicByBookingIdAndGorSlug(
    bookingId: string,
    gorSlug: string,
  ): Promise<InvoiceWithPaymentSnapshot | null> {
    return this.prisma.invoice.findFirst({
      where: {
        status: INVOICE_STATUS.GENERATED,
        payment: {
          status: PAYMENT_STATUS.PAID,
          bookingId,
          booking: {
            court: {
              gor: {
                slug: gorSlug,
              },
            },
          },
        },
      },
      include: {
        payment: {
          select: {
            method: true,
            status: true,
            externalReference: true,
            paidAt: true,
          },
        },
      },
    });
  }

  async findManyForOwner(input: ListOwnerInvoicesInput): Promise<{
    items: OwnerInvoiceRecord[];
    total: number;
  }> {
    const where: Prisma.InvoiceWhereInput = {
      payment: {
        booking: {
          court: {
            gor: {
              ownerId: input.ownerId,
            },
          },
        },
      },
      ...(input.invoiceNumberSearch
        ? {
            invoiceNumber: {
              contains: input.invoiceNumberSearch,
              mode: "insensitive",
            },
          }
        : {}),
      ...(input.bookingNumberSearch
        ? {
            bookingNumberSnapshot: {
              contains: input.bookingNumberSearch,
              mode: "insensitive",
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy: {
          generatedAt: "desc",
        },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        include: {
          payment: {
            select: ownerInvoicePaymentSelect,
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { items, total };
  }

  async findByIdForOwner(
    invoiceId: string,
    ownerId: string,
  ): Promise<OwnerInvoiceRecord | null> {
    return this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        payment: {
          booking: {
            court: {
              gor: {
                ownerId,
              },
            },
          },
        },
      },
      include: {
        payment: {
          select: ownerInvoicePaymentSelect,
        },
      },
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
