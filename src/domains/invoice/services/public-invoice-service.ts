import { PublicInvoiceNotFoundError } from "@/domains/invoice/errors";
import { generateInvoicePdfFromSnapshot } from "@/domains/invoice/pdf/generate-invoice-pdf-from-snapshot";
import type { InvoiceWithPaymentSnapshot } from "@/domains/invoice/pdf/invoice-pdf-mapper";
import type { InvoiceRepository } from "@/domains/invoice/repositories/invoice-repository";
import type { PublicInvoiceData } from "@/domains/invoice/types";

type PublicInvoiceServiceDependencies = {
  invoiceRepository: InvoiceRepository;
};

export class PublicInvoiceService {
  private readonly invoiceRepository: InvoiceRepository;

  constructor({ invoiceRepository }: PublicInvoiceServiceDependencies) {
    this.invoiceRepository = invoiceRepository;
  }

  async getInvoiceForCheckout(
    gorSlug: string,
    bookingId: string,
  ): Promise<PublicInvoiceData> {
    const invoice = await this.findPublicInvoiceRecord(gorSlug, bookingId);

    if (!invoice) {
      throw new PublicInvoiceNotFoundError();
    }

    return this.mapToPublicInvoiceData(invoice, gorSlug, bookingId);
  }

  async findInvoiceForCheckout(
    gorSlug: string,
    bookingId: string,
  ): Promise<PublicInvoiceData | null> {
    const invoice = await this.findPublicInvoiceRecord(gorSlug, bookingId);

    if (!invoice) {
      return null;
    }

    return this.mapToPublicInvoiceData(invoice, gorSlug, bookingId);
  }

  async generatePdfForCheckout(
    gorSlug: string,
    bookingId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const invoice = await this.findPublicInvoiceRecord(gorSlug, bookingId);

    if (!invoice) {
      throw new PublicInvoiceNotFoundError();
    }

    return generateInvoicePdfFromSnapshot(invoice);
  }

  private async findPublicInvoiceRecord(
    gorSlug: string,
    bookingId: string,
  ): Promise<InvoiceWithPaymentSnapshot | null> {
    return this.invoiceRepository.findPublicByBookingIdAndGorSlug(
      bookingId,
      gorSlug,
    );
  }

  private mapToPublicInvoiceData(
    invoice: InvoiceWithPaymentSnapshot,
    gorSlug: string,
    bookingId: string,
  ): PublicInvoiceData {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      generatedAt: invoice.generatedAt.toISOString(),
      bookingId,
      bookingNumber: invoice.bookingNumberSnapshot,
      customerName: invoice.customerNameSnapshot,
      customerPhone: invoice.customerPhoneSnapshot,
      venueName: invoice.gorNameSnapshot,
      venueSlug: gorSlug,
      courtName: invoice.courtNameSnapshot,
      bookingDate: invoice.bookingDateSnapshot.toISOString(),
      startMinute: invoice.startMinuteSnapshot,
      endMinute: invoice.endMinuteSnapshot,
      totalAmount: invoice.totalAmountSnapshot,
    };
  }
}

export function createPublicInvoiceService(
  dependencies: PublicInvoiceServiceDependencies,
): PublicInvoiceService {
  return new PublicInvoiceService(dependencies);
}
