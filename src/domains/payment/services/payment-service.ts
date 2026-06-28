import { PAYMENT_STATUS } from "@/domains/payment/constants";
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
} from "@/domains/payment/types";
import {
  parseMidtransTransactionTime,
  resolveMidtransCallbackStatus,
} from "@/domains/payment/utils/midtrans-callback-status";
import type { BookingWriter } from "@/domains/payment/writers/booking-writer";
import { createPaymentBookingWriter } from "@/domains/payment/writers/booking-writer";
import type { PrismaClient } from "@/generated/prisma/client";

type PaymentServiceDependencies = {
  paymentRepository: PaymentRepository;
  bookingReader: BookingReader;
  bookingWriter: BookingWriter;
  paymentGateway: PaymentGateway;
};

export class PaymentService {
  private readonly paymentRepository: PaymentRepository;
  private readonly bookingReader: BookingReader;
  private readonly bookingWriter: BookingWriter;
  private readonly paymentGateway: PaymentGateway;

  constructor({
    paymentRepository,
    bookingReader,
    bookingWriter,
    paymentGateway,
  }: PaymentServiceDependencies) {
    this.paymentRepository = paymentRepository;
    this.bookingReader = bookingReader;
    this.bookingWriter = bookingWriter;
    this.paymentGateway = paymentGateway;
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

    const payment = await this.paymentRepository.create({
      bookingId: input.bookingId,
      amount: booking.totalPrice,
    });

    try {
      const gatewayResult = await this.paymentGateway.createTransaction({
        orderId: payment.id,
        amount: booking.totalPrice,
        customerName: booking.contact.customerName,
        customerPhone: booking.contact.customerPhone,
      });

      await this.paymentRepository.update({
        id: payment.id,
        externalReference: gatewayResult.transactionId,
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

  async handleMidtransCallback(
    payload: MidtransCallbackPayload,
  ): Promise<Payment | null> {
    if (!this.paymentGateway.verifyCallbackSignature(payload)) {
      throw new PaymentInvalidSignatureError();
    }

    const payment = await this.paymentRepository.findByExternalReference(
      payload.order_id,
    );

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
        const updatedPayment = await this.markAsPaid({
          id: payment.id,
          externalReference: payload.order_id,
          paidAt: parseMidtransTransactionTime(payload.transaction_time),
        });

        await this.bookingWriter.confirmIfPending(payment.bookingId);

        return updatedPayment;
      }
      case "expired": {
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

export function createPaymentService(prisma: PrismaClient): PaymentService {
  return new PaymentService({
    paymentRepository: new PaymentRepository(prisma),
    bookingReader: createPaymentBookingReader(prisma),
    bookingWriter: createPaymentBookingWriter(prisma),
    paymentGateway: createMidtransGateway(),
  });
}
