import { InvoiceNotFoundError } from "@/domains/invoice/errors";
import { generateInvoicePdfFromSnapshot } from "@/domains/invoice/pdf/generate-invoice-pdf-from-snapshot";
import type { InvoiceWithPaymentSnapshot } from "@/domains/invoice/pdf/invoice-pdf-mapper";
import type {
  InvoiceRepository,
  OwnerInvoiceRecord,
} from "@/domains/invoice/repositories/invoice-repository";
import type {
  ListOwnerInvoicesInput,
  ListOwnerInvoicesResult,
  OwnerInvoiceDetail,
  OwnerInvoiceListItem,
} from "@/domains/invoice/types";
import { PAYMENT_METHOD_LABELS } from "@/domains/payment/constants";

type OwnerInvoiceServiceDependencies = {
  invoiceRepository: InvoiceRepository;
};

export class OwnerInvoiceService {
  private readonly invoiceRepository: InvoiceRepository;

  constructor({ invoiceRepository }: OwnerInvoiceServiceDependencies) {
    this.invoiceRepository = invoiceRepository;
  }

  async listInvoices(
    input: ListOwnerInvoicesInput,
  ): Promise<ListOwnerInvoicesResult> {
    const { items, total } =
      await this.invoiceRepository.findManyForOwner(input);

    return {
      items: items.map((invoice) => this.mapToListItem(invoice)),
      total,
      page: input.page,
      pageSize: input.pageSize,
    };
  }

  async getInvoiceDetail(
    invoiceId: string,
    ownerId: string,
  ): Promise<OwnerInvoiceDetail> {
    const invoice = await this.invoiceRepository.findByIdForOwner(
      invoiceId,
      ownerId,
    );

    if (!invoice) {
      throw new InvoiceNotFoundError(`Invoice not found: ${invoiceId}`);
    }

    return this.mapToDetail(invoice);
  }

  async generatePdfForOwner(
    invoiceId: string,
    ownerId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const invoice = await this.invoiceRepository.findByIdForOwner(
      invoiceId,
      ownerId,
    );

    if (!invoice) {
      throw new InvoiceNotFoundError(`Invoice not found: ${invoiceId}`);
    }

    return generateInvoicePdfFromSnapshot(
      invoice as InvoiceWithPaymentSnapshot,
    );
  }

  private mapToListItem(invoice: OwnerInvoiceRecord): OwnerInvoiceListItem {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      bookingId: invoice.payment.bookingId,
      bookingNumber: invoice.bookingNumberSnapshot,
      customerName: invoice.customerNameSnapshot,
      courtName: invoice.courtNameSnapshot,
      bookingDate: invoice.bookingDateSnapshot.toISOString(),
      totalAmount: invoice.totalAmountSnapshot,
      status: invoice.status,
      paymentStatus: invoice.payment.status,
      generatedAt: invoice.generatedAt.toISOString(),
    };
  }

  private mapToDetail(invoice: OwnerInvoiceRecord): OwnerInvoiceDetail {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      bookingId: invoice.payment.bookingId,
      bookingNumber: invoice.bookingNumberSnapshot,
      customerName: invoice.customerNameSnapshot,
      customerPhone: invoice.customerPhoneSnapshot,
      venueName: invoice.gorNameSnapshot,
      courtName: invoice.courtNameSnapshot,
      bookingDate: invoice.bookingDateSnapshot.toISOString(),
      startMinute: invoice.startMinuteSnapshot,
      endMinute: invoice.endMinuteSnapshot,
      totalAmount: invoice.totalAmountSnapshot,
      status: invoice.status,
      paymentStatus: invoice.payment.status,
      generatedAt: invoice.generatedAt.toISOString(),
      paymentMethod:
        PAYMENT_METHOD_LABELS[invoice.payment.method] ?? invoice.payment.method,
      paymentReference: invoice.payment.externalReference ?? invoice.paymentId,
      paidAt: invoice.payment.paidAt?.toISOString() ?? null,
    };
  }
}

export function createOwnerInvoiceService(
  dependencies: OwnerInvoiceServiceDependencies,
): OwnerInvoiceService {
  return new OwnerInvoiceService(dependencies);
}
