import { MANUAL_PAYMENT_OWNER_REMINDER_HOURS } from "@/domains/booking/constants";
import { resolveAwaitingConfirmationExpiresAt } from "@/domains/booking/utils/booking-expiration";
import {
  PAYMENT_CONFIRMATION_ACTION,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "@/domains/payment/constants";
import {
  ManualPaymentAccessDeniedError,
  ManualPaymentNotFoundError,
  PaymentValidationError,
} from "@/domains/payment/errors";
import type { PaymentAuditRepository } from "@/domains/payment/repositories/payment-audit-repository";
import type { PaymentRepository } from "@/domains/payment/repositories/payment-repository";
import type { PaymentService } from "@/domains/payment/services/payment-service";
import type {
  AwaitingConfirmationPaymentItem,
  ManualPaymentDetailData,
  OwnerPaymentInstructions,
} from "@/domains/payment/types";
import { isOwnerReminderDue } from "@/domains/payment/utils/customer-payment-status";
import type { BookingWriter } from "@/domains/payment/writers/booking-writer";
import type { PrismaClient } from "@/generated/prisma/client";

type ManualPaymentServiceDependencies = {
  prisma: PrismaClient;
  paymentRepository: PaymentRepository;
  paymentAuditRepository: PaymentAuditRepository;
  paymentService: PaymentService;
  bookingWriter: BookingWriter;
};

export class ManualPaymentService {
  private readonly prisma: PrismaClient;
  private readonly paymentRepository: PaymentRepository;
  private readonly paymentAuditRepository: PaymentAuditRepository;
  private readonly paymentService: PaymentService;
  private readonly bookingWriter: BookingWriter;

  constructor({
    prisma,
    paymentRepository,
    paymentAuditRepository,
    paymentService,
    bookingWriter,
  }: ManualPaymentServiceDependencies) {
    this.prisma = prisma;
    this.paymentRepository = paymentRepository;
    this.paymentAuditRepository = paymentAuditRepository;
    this.paymentService = paymentService;
    this.bookingWriter = bookingWriter;
  }

  async ensureManualPayment(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        totalPrice: true,
        status: true,
      },
    });

    if (!booking) {
      throw new ManualPaymentNotFoundError();
    }

    const existingPaid =
      await this.paymentRepository.findPaidByBookingId(bookingId);

    if (existingPaid) {
      return existingPaid;
    }

    const activePayment =
      await this.paymentRepository.findActiveManualPaymentByBookingId(
        bookingId,
      );

    if (activePayment) {
      return activePayment;
    }

    const payment = await this.paymentRepository.create({
      bookingId,
      amount: booking.totalPrice,
      method: PAYMENT_METHOD.MANUAL_TRANSFER,
    });

    await this.paymentAuditRepository.create({
      paymentId: payment.id,
      action: PAYMENT_CONFIRMATION_ACTION.CREATED,
      fromStatus: null,
      toStatus: PAYMENT_STATUS.PENDING,
    });

    return payment;
  }

  async submitCustomerConfirmation(input: {
    gorSlug: string;
    bookingId: string;
  }) {
    const booking = await this.requirePublicBooking(
      input.gorSlug,
      input.bookingId,
    );

    if (booking.status !== "PENDING") {
      throw new PaymentValidationError("Booking tidak dapat dikonfirmasi.");
    }

    if (booking.expiresAt.getTime() < Date.now()) {
      throw new PaymentValidationError("Waktu pembayaran booking sudah habis.");
    }

    const payment = await this.ensureManualPayment(booking.id);

    if (payment.status === PAYMENT_STATUS.PAID) {
      return payment;
    }

    if (payment.status === PAYMENT_STATUS.AWAITING_CONFIRMATION) {
      return payment;
    }

    if (payment.status === PAYMENT_STATUS.REJECTED) {
      throw new PaymentValidationError(
        "Pembayaran ditolak. Hubungi pemilik venue untuk bantuan.",
      );
    }

    const now = new Date();
    const updatedPayment = await this.paymentRepository.update({
      id: payment.id,
      status: PAYMENT_STATUS.AWAITING_CONFIRMATION,
      customerConfirmedAt: now,
    });

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        expiresAt: resolveAwaitingConfirmationExpiresAt(now),
      },
    });

    await this.paymentAuditRepository.create({
      paymentId: payment.id,
      action: PAYMENT_CONFIRMATION_ACTION.CUSTOMER_CONFIRMED,
      fromStatus: PAYMENT_STATUS.PENDING,
      toStatus: PAYMENT_STATUS.AWAITING_CONFIRMATION,
    });

    return updatedPayment;
  }

  async cancelBookingByCustomer(input: { gorSlug: string; bookingId: string }) {
    const booking = await this.requirePublicBooking(
      input.gorSlug,
      input.bookingId,
    );

    if (booking.status === "CONFIRMED") {
      throw new PaymentValidationError("Booking sudah dikonfirmasi.");
    }

    if (booking.status === "CANCELLED") {
      return;
    }

    const activePayment =
      await this.paymentRepository.findActiveManualPaymentByBookingId(
        booking.id,
      );

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });

    if (activePayment) {
      await this.paymentRepository.update({
        id: activePayment.id,
        status: PAYMENT_STATUS.EXPIRED,
      });

      await this.paymentAuditRepository.create({
        paymentId: activePayment.id,
        action: PAYMENT_CONFIRMATION_ACTION.CANCELLED,
        fromStatus: activePayment.status,
        toStatus: PAYMENT_STATUS.EXPIRED,
        note: "Dibatalkan oleh pelanggan",
      });
    }
  }

  async listAwaitingConfirmation(
    ownerId: string,
  ): Promise<AwaitingConfirmationPaymentItem[]> {
    const payments =
      await this.paymentRepository.findAwaitingConfirmationByOwnerId(ownerId);

    return payments.map((payment) => ({
      paymentId: payment.id,
      bookingId: payment.booking.id,
      bookingNumber: payment.booking.bookingNumber,
      customerName: payment.booking.contact?.customerName ?? "-",
      customerPhone: payment.booking.contact?.customerPhone ?? "-",
      courtName: payment.booking.courtNameSnapshot,
      bookingDate: payment.booking.bookingDate.toISOString(),
      startMinute: payment.booking.startMinute,
      endMinute: payment.booking.endMinute,
      durationMinute: payment.booking.durationMinute,
      amount: payment.amount,
      customerConfirmedAt: payment.customerConfirmedAt?.toISOString() ?? null,
      showReminder: isOwnerReminderDue(
        payment.customerConfirmedAt?.toISOString() ?? null,
        MANUAL_PAYMENT_OWNER_REMINDER_HOURS,
      ),
    }));
  }

  async getOwnerPaymentDetail(input: {
    ownerId: string;
    bookingId: string;
  }): Promise<ManualPaymentDetailData> {
    const payment =
      await this.paymentRepository.findManualPaymentDetailForOwner({
        ownerId: input.ownerId,
        bookingId: input.bookingId,
      });

    if (!payment) {
      throw new ManualPaymentNotFoundError();
    }

    const gor = payment.booking.court.gor;

    return {
      paymentId: payment.id,
      bookingId: payment.booking.id,
      bookingNumber: payment.booking.bookingNumber,
      customerName: payment.booking.contact?.customerName ?? "-",
      customerPhone: payment.booking.contact?.customerPhone ?? "-",
      customerNote: payment.booking.contact?.note ?? null,
      venueName: gor.name,
      courtName: payment.booking.courtNameSnapshot,
      bookingDate: payment.booking.bookingDate.toISOString(),
      startMinute: payment.booking.startMinute,
      endMinute: payment.booking.endMinute,
      durationMinute: payment.booking.durationMinute,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      customerConfirmedAt: payment.customerConfirmedAt?.toISOString() ?? null,
      rejectionReason: payment.rejectionReason,
      ownerPaymentInstructions: buildOwnerPaymentInstructions(gor),
      showReminder: isOwnerReminderDue(
        payment.customerConfirmedAt?.toISOString() ?? null,
        MANUAL_PAYMENT_OWNER_REMINDER_HOURS,
      ),
      auditLogs: payment.auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        actorUserId: log.actorUserId,
        fromStatus: log.fromStatus,
        toStatus: log.toStatus,
        note: log.note,
        createdAt: log.createdAt.toISOString(),
      })),
    };
  }

  async approvePayment(input: {
    ownerId: string;
    ownerUserId: string;
    bookingId: string;
  }) {
    const payment = await this.requireOwnerPayment(
      input.ownerId,
      input.bookingId,
    );

    if (payment.status === PAYMENT_STATUS.PAID) {
      return payment;
    }

    if (payment.status !== PAYMENT_STATUS.AWAITING_CONFIRMATION) {
      throw new PaymentValidationError(
        "Pembayaran tidak menunggu konfirmasi owner.",
      );
    }

    const now = new Date();
    const updatedPayment = await this.paymentService.markAsPaid({
      id: payment.id,
      externalReference: `manual-${payment.id}`,
      paidAt: now,
    });

    await this.paymentRepository.update({
      id: payment.id,
      approvedByUserId: input.ownerUserId,
      approvedAt: now,
    });

    await this.bookingWriter.confirmIfPending(payment.bookingId);
    await this.paymentService.ensureInvoiceForPaidPaymentPublic(payment.id);

    await this.paymentAuditRepository.create({
      paymentId: payment.id,
      actorUserId: input.ownerUserId,
      action: PAYMENT_CONFIRMATION_ACTION.APPROVED,
      fromStatus: PAYMENT_STATUS.AWAITING_CONFIRMATION,
      toStatus: PAYMENT_STATUS.PAID,
    });

    return updatedPayment;
  }

  async rejectPayment(input: {
    ownerId: string;
    ownerUserId: string;
    bookingId: string;
    reason: string;
  }) {
    const payment = await this.requireOwnerPayment(
      input.ownerId,
      input.bookingId,
    );

    if (payment.status !== PAYMENT_STATUS.AWAITING_CONFIRMATION) {
      throw new PaymentValidationError(
        "Pembayaran tidak menunggu konfirmasi owner.",
      );
    }

    const reason = input.reason.trim();

    if (!reason) {
      throw new PaymentValidationError("Alasan penolakan wajib diisi.");
    }

    const now = new Date();
    const updatedPayment = await this.paymentRepository.update({
      id: payment.id,
      status: PAYMENT_STATUS.REJECTED,
      rejectedByUserId: input.ownerUserId,
      rejectedAt: now,
      rejectionReason: reason,
    });

    await this.paymentAuditRepository.create({
      paymentId: payment.id,
      actorUserId: input.ownerUserId,
      action: PAYMENT_CONFIRMATION_ACTION.REJECTED,
      fromStatus: PAYMENT_STATUS.AWAITING_CONFIRMATION,
      toStatus: PAYMENT_STATUS.REJECTED,
      note: reason,
    });

    return updatedPayment;
  }

  private async requirePublicBooking(gorSlug: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        court: {
          select: {
            gor: {
              select: { slug: true },
            },
          },
        },
      },
    });

    if (!booking || booking.court.gor.slug !== gorSlug) {
      throw new ManualPaymentNotFoundError();
    }

    return booking;
  }

  private async requireOwnerPayment(ownerId: string, bookingId: string) {
    const payment =
      await this.paymentRepository.findManualPaymentDetailForOwner({
        ownerId,
        bookingId,
      });

    if (!payment) {
      throw new ManualPaymentAccessDeniedError();
    }

    return payment;
  }
}

function buildOwnerPaymentInstructions(gor: {
  name: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  qrisImageUrl: string | null;
}): OwnerPaymentInstructions {
  return {
    venueName: gor.name,
    bankName: gor.bankName,
    bankAccountNumber: gor.bankAccountNumber,
    bankAccountHolder: gor.bankAccountHolder,
    qrisImageUrl: gor.qrisImageUrl,
  };
}

export function createManualPaymentService(
  dependencies: ManualPaymentServiceDependencies,
): ManualPaymentService {
  return new ManualPaymentService(dependencies);
}
