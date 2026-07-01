import { PAYMENT_STATUS } from "@/domains/payment/constants";
import { REVENUE_RECENT_PAYMENTS_LIMIT } from "@/domains/payment/constants";
import {
  BookingNotFoundForPaymentError,
  PaymentInvalidSignatureError,
  PaymentNotFoundError,
  PaymentValidationError,
} from "@/domains/payment/errors";
import type { PaymentGateway } from "@/domains/payment/gateway/payment-gateway";
import { createMidtransGateway } from "@/domains/payment/gateway/midtrans-gateway";
import type { BookingReader } from "@/domains/payment/readers/booking-reader";
import { createPaymentBookingReader } from "@/domains/payment/readers/booking-reader";
import {
  PaymentRepository,
  type Payment,
} from "@/domains/payment/repositories/payment-repository";
import type {
  CreatePaymentInput,
  CreatePaymentRequest,
  CreatePaymentResult,
  FindPaymentsByBookingIdInput,
  MarkPaymentAsPaidInput,
  MarkPaymentStatusInput,
  MidtransCallbackPayload,
  RevenueDashboardData,
  RevenueDashboardInput,
} from "@/domains/payment/types";
import {
  buildMonthDailyRevenuePoints,
  endOfMonth,
  resolveRevenueDateRange,
  startOfMonth,
} from "@/domains/payment/utils/revenue-date-range";
import {
  parseMidtransTransactionTime,
  resolveMidtransCallbackStatus,
} from "@/domains/payment/utils/midtrans-callback-status";
import type { BookingWriter } from "@/domains/payment/writers/booking-writer";
import { createPaymentBookingWriter } from "@/domains/payment/writers/booking-writer";
import type { InvoiceService } from "@/domains/invoice/services/invoice-service";
import { createInvoiceService } from "@/domains/invoice/services/invoice-service";
import type { PrismaClient } from "@/generated/prisma/client";
import { logError, logInfo } from "@/lib/server/logger";

type PaymentServiceDependencies = {
  paymentRepository: PaymentRepository;
  bookingReader: BookingReader;
  bookingWriter: BookingWriter;
  paymentGateway: PaymentGateway;
  invoiceService: InvoiceService;
};

type BookingForPaymentLaunch = NonNullable<
  Awaited<ReturnType<BookingReader["findById"]>>
> & {
  contact: NonNullable<
    NonNullable<Awaited<ReturnType<BookingReader["findById"]>>>["contact"]
  >;
};

export class PaymentService {
  private readonly paymentRepository: PaymentRepository;
  private readonly bookingReader: BookingReader;
  private readonly bookingWriter: BookingWriter;
  private readonly paymentGateway: PaymentGateway;
  private readonly invoiceService: InvoiceService;

  constructor({
    paymentRepository,
    bookingReader,
    bookingWriter,
    paymentGateway,
    invoiceService,
  }: PaymentServiceDependencies) {
    this.paymentRepository = paymentRepository;
    this.bookingReader = bookingReader;
    this.bookingWriter = bookingWriter;
    this.paymentGateway = paymentGateway;
    this.invoiceService = invoiceService;
  }

  async createPayment(
    input: CreatePaymentRequest,
  ): Promise<CreatePaymentResult> {
    const booking = await this.bookingReader.findById(input.bookingId);

    if (!booking) {
      throw new BookingNotFoundForPaymentError(
        `Booking not found: ${input.bookingId}`,
      );
    }

    const existingPaid = await this.paymentRepository.findPaidByBookingId(
      input.bookingId,
    );

    if (existingPaid) {
      throw new PaymentValidationError("Booking already has a paid payment");
    }

    if (!booking.contact) {
      throw new PaymentValidationError(
        "Booking contact is required to create payment",
      );
    }

    if (booking.status !== "PENDING") {
      throw new PaymentValidationError("Booking is not pending payment");
    }

    if (booking.expiresAt.getTime() < Date.now()) {
      throw new PaymentValidationError("Booking payment window has expired");
    }

    const existingPending = await this.paymentRepository.findPendingByBookingId(
      input.bookingId,
    );

    if (existingPending) {
      if (existingPending.amount !== booking.totalPrice) {
        throw new PaymentValidationError(
          "Pending payment amount does not match booking total",
        );
      }

      if (existingPending.paymentUrl && existingPending.snapToken) {
        logInfo("Reusing pending payment Snap session for booking", {
          paymentId: existingPending.id,
          bookingId: input.bookingId,
        });

        return {
          paymentUrl: existingPending.paymentUrl,
          token: existingPending.snapToken,
          transactionId:
            existingPending.externalReference ?? existingPending.id,
        };
      }

      return this.launchGatewayForPayment(
        existingPending,
        booking as BookingForPaymentLaunch,
        input.finishRedirectUrl,
      );
    }

    const payment = await this.paymentRepository.create({
      bookingId: input.bookingId,
      amount: booking.totalPrice,
    });

    return this.launchGatewayForPayment(
      payment,
      booking as BookingForPaymentLaunch,
      input.finishRedirectUrl,
    );
  }

  async handleMidtransCallback(
    payload: MidtransCallbackPayload,
  ): Promise<Payment | null> {
    if (!this.paymentGateway.verifyCallbackSignature(payload)) {
      throw new PaymentInvalidSignatureError();
    }

    const payment =
      (await this.paymentRepository.findById(payload.order_id)) ??
      (await this.paymentRepository.findByExternalReference(payload.order_id));

    if (!payment) {
      throw new PaymentNotFoundError(
        `Payment not found for order: ${payload.order_id}`,
      );
    }

    const grossAmount = Number(payload.gross_amount);

    if (!Number.isFinite(grossAmount) || grossAmount !== payment.amount) {
      throw new PaymentValidationError(
        "Callback gross amount does not match payment amount",
      );
    }

    const resolution = resolveMidtransCallbackStatus(payload);

    switch (resolution) {
      case "paid": {
        if (payment.status === PAYMENT_STATUS.PAID) {
          logInfo(
            "Duplicate Midtrans paid callback ignored for booking payment",
            {
              paymentId: payment.id,
              bookingId: payment.bookingId,
              orderId: payload.order_id,
            },
          );

          await this.ensureInvoiceForPaidPayment(payment.id);

          return payment;
        }

        const updatedPayment = await this.markAsPaid({
          id: payment.id,
          externalReference: payload.order_id,
          paidAt: parseMidtransTransactionTime(payload.transaction_time),
        });

        await this.bookingWriter.confirmIfPending(payment.bookingId);
        await this.ensureInvoiceForPaidPayment(updatedPayment.id);

        return updatedPayment;
      }
      case "expired": {
        if (payment.status === PAYMENT_STATUS.EXPIRED) {
          logInfo(
            "Duplicate Midtrans expired callback ignored for booking payment",
            {
              paymentId: payment.id,
              bookingId: payment.bookingId,
              orderId: payload.order_id,
            },
          );

          await this.bookingWriter.cancelIfPending(payment.bookingId);

          return payment;
        }

        if (payment.status === PAYMENT_STATUS.PAID) {
          logInfo(
            "Midtrans expired callback ignored for already paid booking payment",
            {
              paymentId: payment.id,
              bookingId: payment.bookingId,
              orderId: payload.order_id,
            },
          );

          return payment;
        }

        const updatedPayment = await this.markAsExpired({ id: payment.id });

        await this.bookingWriter.cancelIfPending(payment.bookingId);

        return updatedPayment;
      }
      case "failed":
        return this.markAsFailed({ id: payment.id });
      case "pending":
      case "ignored":
      default:
        return payment;
    }
  }

  async getRevenueDashboard(
    input: RevenueDashboardInput,
    referenceDate: Date = new Date(),
  ): Promise<RevenueDashboardData> {
    const monthStart = startOfMonth(referenceDate);
    const monthEnd = endOfMonth(referenceDate);
    const { from: rangeFrom, to: rangeTo } = resolveRevenueDateRange(
      input.preset,
      referenceDate,
      input.customFrom,
      input.customTo,
    );

    const todayStart = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate(),
    );
    const todayEnd = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate(),
      23,
      59,
      59,
      999,
    );

    const snapshot = await this.paymentRepository.fetchRevenueSnapshot({
      ownerId: input.ownerId,
      todayStart,
      todayEnd,
      monthStart,
      monthEnd,
      rangeFrom,
      rangeTo,
      recentLimit: REVENUE_RECENT_PAYMENTS_LIMIT,
    });

    return {
      summary: {
        todayRevenue: snapshot.todayRevenue,
        monthRevenue: snapshot.monthRevenue,
        completedPayments: snapshot.completedPayments,
        pendingPayments: snapshot.pendingPayments,
      },
      chart: buildMonthDailyRevenuePoints(
        monthStart,
        monthEnd,
        snapshot.paidInMonth,
      ),
      recentPayments: snapshot.recentPayments.map((payment) => ({
        id: payment.id,
        bookingNumber: payment.booking.bookingNumber,
        customerName: payment.booking.contact?.customerName ?? "-",
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt?.toISOString() ?? null,
      })),
      dateRange: {
        preset: input.preset,
        from: rangeFrom.toISOString(),
        to: rangeTo.toISOString(),
      },
    };
  }

  async createPaymentAttempt(input: CreatePaymentInput): Promise<Payment> {
    if (input.amount <= 0) {
      throw new PaymentValidationError(
        "Payment amount must be greater than zero",
      );
    }

    return this.paymentRepository.create(input);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.paymentRepository.findById(id);
  }

  async findByBookingId(
    input: FindPaymentsByBookingIdInput,
  ): Promise<Payment[]> {
    return this.paymentRepository.findByBookingId(input);
  }

  async markAsPaid(input: MarkPaymentAsPaidInput): Promise<Payment> {
    const payment = await this.requirePayment(input.id);

    if (payment.status === PAYMENT_STATUS.PAID) {
      logInfo("Payment already marked as paid", {
        paymentId: payment.id,
        bookingId: payment.bookingId,
      });

      return payment;
    }

    await this.ensureNoOtherPaidPayment(payment.bookingId, payment.id);

    return this.paymentRepository.update({
      id: input.id,
      status: PAYMENT_STATUS.PAID,
      externalReference: input.externalReference,
      paidAt: input.paidAt ?? new Date(),
    });
  }

  async markAsFailed(input: MarkPaymentStatusInput): Promise<Payment> {
    const payment = await this.requirePayment(input.id);

    if (payment.status === PAYMENT_STATUS.PAID) {
      throw new PaymentValidationError(
        "Paid payment cannot be marked as failed",
      );
    }

    return this.paymentRepository.update({
      id: input.id,
      status: PAYMENT_STATUS.FAILED,
    });
  }

  async markAsExpired(input: MarkPaymentStatusInput): Promise<Payment> {
    const payment = await this.requirePayment(input.id);

    if (payment.status === PAYMENT_STATUS.PAID) {
      throw new PaymentValidationError(
        "Paid payment cannot be marked as expired",
      );
    }

    if (payment.status === PAYMENT_STATUS.EXPIRED) {
      return payment;
    }

    return this.paymentRepository.update({
      id: input.id,
      status: PAYMENT_STATUS.EXPIRED,
    });
  }

  async markAsRefunded(input: MarkPaymentStatusInput): Promise<Payment> {
    const payment = await this.requirePayment(input.id);

    if (payment.status !== PAYMENT_STATUS.PAID) {
      throw new PaymentValidationError(
        "Only paid payments can be marked as refunded",
      );
    }

    return this.paymentRepository.update({
      id: input.id,
      status: PAYMENT_STATUS.REFUNDED,
    });
  }

  private async launchGatewayForPayment(
    payment: Payment,
    booking: BookingForPaymentLaunch,
    finishRedirectUrl?: string,
  ): Promise<CreatePaymentResult> {
    try {
      const gatewayResult = await this.paymentGateway.createTransaction({
        orderId: payment.id,
        amount: booking.totalPrice,
        customerName: booking.contact.customerName,
        customerPhone: booking.contact.customerPhone,
        finishRedirectUrl,
      });

      await this.paymentRepository.update({
        id: payment.id,
        externalReference: gatewayResult.transactionId,
        paymentUrl: gatewayResult.paymentUrl,
        snapToken: gatewayResult.token,
      });

      return {
        paymentUrl: gatewayResult.paymentUrl,
        token: gatewayResult.token,
        transactionId: gatewayResult.transactionId,
      };
    } catch (error) {
      await this.paymentRepository.update({
        id: payment.id,
        status: PAYMENT_STATUS.FAILED,
      });

      throw error;
    }
  }

  private async ensureInvoiceForPaidPayment(paymentId: string): Promise<void> {
    try {
      await this.invoiceService.generateInvoice({ paymentId });
    } catch (error) {
      logError("Failed to generate invoice for paid payment", error, {
        paymentId,
      });
    }
  }

  private async requirePayment(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new PaymentNotFoundError(`Payment not found: ${id}`);
    }

    return payment;
  }

  private async ensureNoOtherPaidPayment(
    bookingId: string,
    paymentId: string,
  ): Promise<void> {
    const existingPaid =
      await this.paymentRepository.findPaidByBookingId(bookingId);

    if (existingPaid && existingPaid.id !== paymentId) {
      throw new PaymentValidationError("Booking already has a paid payment");
    }
  }
}

export function createPaymentService(
  prisma: PrismaClient,
  dependencies?: Partial<PaymentServiceDependencies>,
): PaymentService {
  return new PaymentService({
    paymentRepository:
      dependencies?.paymentRepository ?? new PaymentRepository(prisma),
    bookingReader:
      dependencies?.bookingReader ?? createPaymentBookingReader(prisma),
    bookingWriter:
      dependencies?.bookingWriter ?? createPaymentBookingWriter(prisma),
    paymentGateway: dependencies?.paymentGateway ?? createMidtransGateway(),
    invoiceService:
      dependencies?.invoiceService ?? createInvoiceService(prisma),
  });
}
