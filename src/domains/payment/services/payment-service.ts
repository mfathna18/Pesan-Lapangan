import { PAYMENT_STATUS } from "@/domains/payment/constants";
import {
  PaymentNotFoundError,
  PaymentValidationError,
} from "@/domains/payment/errors";
import {
  PaymentRepository,
  type Payment,
} from "@/domains/payment/repositories/payment-repository";
import type {
  CreatePaymentInput,
  FindPaymentsByBookingIdInput,
  MarkPaymentAsPaidInput,
  MarkPaymentStatusInput,
} from "@/domains/payment/types";
import type { PrismaClient } from "@/generated/prisma/client";

type PaymentServiceDependencies = {
  paymentRepository: PaymentRepository;
};

export class PaymentService {
  private readonly paymentRepository: PaymentRepository;

  constructor({ paymentRepository }: PaymentServiceDependencies) {
    this.paymentRepository = paymentRepository;
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
  });
}
