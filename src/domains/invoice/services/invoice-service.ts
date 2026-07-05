import {
  INVOICE_STATUS,
  PAYMENT_STATUS_FOR_INVOICE,
} from "@/domains/invoice/constants";
import {
  InvoiceAlreadyExistsError,
  InvoiceNotFoundError,
  InvoiceValidationError,
} from "@/domains/invoice/errors";
import type { PaymentReader } from "@/domains/invoice/readers/payment-reader";
import { createInvoicePaymentReader } from "@/domains/invoice/readers/payment-reader";
import {
  InvoiceRepository,
  type Invoice,
} from "@/domains/invoice/repositories/invoice-repository";
import type {
  GenerateInvoiceInput,
  VoidInvoiceInput,
} from "@/domains/invoice/types";
import { generateInvoiceNumber } from "@/domains/invoice/utils/invoice-number";
import type { PrismaClient } from "@/generated/prisma/client";
import { logInfo } from "@/lib/server/logger";

type InvoiceServiceDependencies = {
  invoiceRepository: InvoiceRepository;
  paymentReader: PaymentReader;
};

export class InvoiceService {
  private readonly invoiceRepository: InvoiceRepository;
  private readonly paymentReader: PaymentReader;

  constructor({
    invoiceRepository,
    paymentReader,
  }: InvoiceServiceDependencies) {
    this.invoiceRepository = invoiceRepository;
    this.paymentReader = paymentReader;
  }

  async generateInvoice(input: GenerateInvoiceInput): Promise<Invoice> {
    const payment = await this.paymentReader.findByIdForInvoice(
      input.paymentId,
    );

    if (!payment) {
      throw new InvoiceValidationError(`Payment not found: ${input.paymentId}`);
    }

    if (payment.status !== PAYMENT_STATUS_FOR_INVOICE) {
      throw new InvoiceValidationError(
        "Invoice can only be generated for a paid payment",
      );
    }

    const existingInvoice = await this.invoiceRepository.findByPaymentId({
      paymentId: input.paymentId,
    });

    if (existingInvoice) {
      if (existingInvoice.status === INVOICE_STATUS.GENERATED) {
        logInfo("Invoice already generated for payment", {
          paymentId: input.paymentId,
          invoiceId: existingInvoice.id,
        });

        return existingInvoice;
      }

      throw new InvoiceAlreadyExistsError(
        "Invoice was voided for this payment; issue a new payment before generating another invoice",
      );
    }

    const booking = payment.booking;

    if (!booking) {
      throw new InvoiceValidationError(
        "Booking not found for the paid payment",
      );
    }

    if (!booking.contact) {
      throw new InvoiceValidationError(
        "Booking contact is required to generate an invoice",
      );
    }

    const generatedAt = payment.paidAt ?? new Date();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const invoiceNumber = await generateInvoiceNumber(
        generatedAt,
        this.invoiceRepository,
      );

      try {
        return await this.invoiceRepository.create({
          paymentId: payment.id,
          invoiceNumber,
          bookingNumberSnapshot: booking.bookingNumber,
          customerNameSnapshot: booking.contact.customerName,
          customerPhoneSnapshot: booking.contact.customerPhone,
          gorNameSnapshot: booking.gorNameSnapshot,
          courtNameSnapshot: booking.courtNameSnapshot,
          bookingDateSnapshot: booking.bookingDate,
          startMinuteSnapshot: booking.startMinute,
          endMinuteSnapshot: booking.endMinute,
          totalAmountSnapshot: payment.amount,
          generatedAt,
        });
      } catch (error) {
        const isUniqueViolation =
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "P2002";

        if (!isUniqueViolation || attempt === 2) {
          throw error;
        }
      }
    }

    throw new InvoiceValidationError("Unable to generate a unique invoice.");
  }

  async voidInvoice(input: VoidInvoiceInput): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(input.id);

    if (!invoice) {
      throw new InvoiceNotFoundError(`Invoice not found: ${input.id}`);
    }

    if (invoice.status === INVOICE_STATUS.VOID) {
      return invoice;
    }

    return this.invoiceRepository.voidInvoice(input.id);
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.invoiceRepository.findById(id);
  }

  async findByPaymentId(paymentId: string): Promise<Invoice | null> {
    return this.invoiceRepository.findByPaymentId({ paymentId });
  }
}

export function createInvoiceService(prisma: PrismaClient): InvoiceService {
  return new InvoiceService({
    invoiceRepository: new InvoiceRepository(prisma),
    paymentReader: createInvoicePaymentReader(prisma),
  });
}
