import { env } from "@/config/env";
import {
  buildCustomerBookingCreatedFromContext,
  buildCustomerBookingReminderFromContext,
  buildCustomerPaymentApprovedFromContext,
  buildCustomerPaymentRejectedMessage,
  buildOwnerBookingCancelledMessage,
  buildOwnerNewBookingFromContext,
  buildOwnerPaymentAwaitingFromContext,
  buildOwnerSubscriptionActivatedMessage,
} from "@/domains/whatsapp/whatsapp-templates";
import { logWhatsAppEvent } from "@/domains/whatsapp/whatsapp-logger";
import { createWhatsAppProvider } from "@/domains/whatsapp/whatsapp-provider";
import {
  computeRetryDelayMs,
  createAsyncWhatsAppQueue,
  delay,
} from "@/domains/whatsapp/whatsapp-queue";
import type {
  WhatsAppLogRepository,
  WhatsAppSettingsRepository,
} from "@/domains/whatsapp/repositories/whatsapp-repository";
import {
  WHATSAPP_MAX_RETRY_ATTEMPTS,
  WHATSAPP_MESSAGE_TYPE,
  WHATSAPP_RECIPIENT_TYPE,
  type WhatsAppBookingContext,
  type WhatsAppProvider,
  type WhatsAppQueueJob,
} from "@/domains/whatsapp/whatsapp-types";
import type { PrismaClient } from "@/generated/prisma/client";

type WhatsAppServiceDependencies = {
  logRepository: WhatsAppLogRepository;
  settingsRepository: WhatsAppSettingsRepository;
  provider?: WhatsAppProvider;
};

export function normalizeWhatsAppPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("62")) {
    return digits;
  }

  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  return digits;
}

function buildAppUrl(path: string): string {
  const baseUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function resolveWhatsAppBookingContext(
  prisma: PrismaClient,
  bookingId: string,
): Promise<WhatsAppBookingContext | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      bookingNumber: true,
      bookingDate: true,
      courtNameSnapshot: true,
      startMinute: true,
      endMinute: true,
      totalPrice: true,
      gorNameSnapshot: true,
      contact: {
        select: {
          customerName: true,
          customerPhone: true,
        },
      },
      court: {
        select: {
          gor: {
            select: {
              ownerId: true,
              slug: true,
              phone: true,
              timezone: true,
              owner: {
                select: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!booking?.contact) {
    return null;
  }

  const gor = booking.court.gor;

  return {
    ownerId: gor.ownerId,
    ownerName: gor.owner.user.name,
    ownerPhone: gor.phone,
    bookingId: booking.id,
    bookingNumber: booking.bookingNumber,
    customerName: booking.contact.customerName,
    customerPhone: booking.contact.customerPhone,
    courtName: booking.courtNameSnapshot,
    gorName: booking.gorNameSnapshot,
    gorSlug: gor.slug,
    bookingDate: booking.bookingDate,
    startMinute: booking.startMinute,
    endMinute: booking.endMinute,
    amount: booking.totalPrice,
    timezone: gor.timezone,
  };
}

export class WhatsAppService {
  private readonly logRepository: WhatsAppLogRepository;
  private readonly settingsRepository: WhatsAppSettingsRepository;
  private readonly provider: WhatsAppProvider;
  private readonly queue;

  constructor({
    logRepository,
    settingsRepository,
    provider,
  }: WhatsAppServiceDependencies) {
    this.logRepository = logRepository;
    this.settingsRepository = settingsRepository;
    this.provider = provider ?? createWhatsAppProvider();
    this.queue = createAsyncWhatsAppQueue({
      processor: (job) => this.processJob(job),
    });
  }

  async getSettingsForOwner(ownerId: string) {
    return this.settingsRepository.getOrCreate(ownerId);
  }

  async updateSettingsForOwner(
    ownerId: string,
    input: Parameters<WhatsAppSettingsRepository["update"]>[1],
  ) {
    return this.settingsRepository.update(ownerId, input);
  }

  enqueue(job: Omit<WhatsAppQueueJob, "logId"> & { logId: string }) {
    this.queue.enqueue(job);
  }

  async queueMessage(input: {
    ownerId?: string;
    bookingId?: string;
    recipientPhone: string;
    recipientType: (typeof WHATSAPP_RECIPIENT_TYPE)[keyof typeof WHATSAPP_RECIPIENT_TYPE];
    messageType: (typeof WHATSAPP_MESSAGE_TYPE)[keyof typeof WHATSAPP_MESSAGE_TYPE];
    messageBody: string;
  }) {
    const normalizedPhone = normalizeWhatsAppPhone(input.recipientPhone);

    if (!normalizedPhone) {
      return;
    }

    const log = await this.logRepository.createPending({
      ownerId: input.ownerId,
      bookingId: input.bookingId,
      recipientPhone: normalizedPhone,
      recipientType: input.recipientType,
      messageType: input.messageType,
      messageBody: input.messageBody,
    });

    this.enqueue({
      logId: log.id,
      recipientPhone: normalizedPhone,
      messageBody: input.messageBody,
      messageType: input.messageType,
      ownerId: input.ownerId,
      bookingId: input.bookingId,
    });
  }

  async processJob(job: WhatsAppQueueJob) {
    const log = await this.logRepository.findById(job.logId);

    if (!log || log.status === "SENT") {
      return;
    }

    let attempt = log.attemptCount;

    while (attempt < WHATSAPP_MAX_RETRY_ATTEMPTS) {
      attempt += 1;

      const result = await this.provider.send({
        to: job.recipientPhone,
        message: job.messageBody,
      });

      if (result.success) {
        await this.logRepository.markSent(job.logId, {
          attemptCount: attempt,
          providerName: this.provider.name,
          providerResponse: result.rawResponse ?? "ok",
        });

        logWhatsAppEvent({
          type: "success",
          logId: job.logId,
          providerName: this.provider.name,
          response: result.rawResponse ?? "ok",
        });

        return;
      }

      const errorMessage =
        result.errorMessage ?? "WhatsApp provider returned failure";

      if (attempt < WHATSAPP_MAX_RETRY_ATTEMPTS) {
        await this.logRepository.markRetrying(job.logId, attempt, errorMessage);

        logWhatsAppEvent({
          type: "retry",
          logId: job.logId,
          attempt,
          error: errorMessage,
        });

        await delay(computeRetryDelayMs(attempt));
        continue;
      }

      await this.logRepository.markFailed(job.logId, {
        attemptCount: attempt,
        providerName: this.provider.name,
        providerResponse: result.rawResponse,
        errorMessage,
      });

      logWhatsAppEvent({
        type: "failed",
        logId: job.logId,
        providerName: this.provider.name,
        error: errorMessage,
      });

      return;
    }
  }

  async processRetryableMessages(limit = 25) {
    const logs = await this.logRepository.listRetryable(limit);

    for (const log of logs) {
      this.enqueue({
        logId: log.id,
        recipientPhone: log.recipientPhone,
        messageBody: log.messageBody,
        messageType: log.messageType,
        ownerId: log.ownerId ?? undefined,
        bookingId: log.bookingId ?? undefined,
      });
    }

    return { queuedCount: logs.length };
  }

  async hasSuccessfulReminder(bookingId: string) {
    return this.logRepository.hasSuccessfulMessage({
      bookingId,
      messageType: WHATSAPP_MESSAGE_TYPE.CUSTOMER_BOOKING_REMINDER,
    });
  }

  async shouldNotifyOwner(
    ownerId: string,
    category: "booking" | "payment" | "subscription",
  ): Promise<boolean> {
    const settings = await this.settingsRepository.getOrCreate(ownerId);

    if (!settings.enabled || !env.WHATSAPP_ENABLED) {
      return false;
    }

    switch (category) {
      case "booking":
        return settings.notifyBooking;
      case "payment":
        return settings.notifyPayment;
      case "subscription":
        return settings.notifySubscription;
      default:
        return false;
    }
  }

  async shouldNotifyCustomerReminder(ownerId: string): Promise<boolean> {
    const settings = await this.settingsRepository.getOrCreate(ownerId);

    return settings.enabled && settings.notifyReminder && env.WHATSAPP_ENABLED;
  }
}

export class WhatsAppEmitter {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly prisma: PrismaClient,
  ) {}

  async emitOwnerNewBooking(bookingId: string) {
    const context = await resolveWhatsAppBookingContext(this.prisma, bookingId);

    if (!context?.ownerPhone) {
      return;
    }

    if (
      !(await this.whatsappService.shouldNotifyOwner(
        context.ownerId,
        "booking",
      ))
    ) {
      return;
    }

    const message = buildOwnerNewBookingFromContext(
      context,
      buildAppUrl("/dashboard/bookings"),
    );

    await this.whatsappService.queueMessage({
      ownerId: context.ownerId,
      bookingId: context.bookingId,
      recipientPhone: context.ownerPhone,
      recipientType: WHATSAPP_RECIPIENT_TYPE.OWNER,
      messageType: WHATSAPP_MESSAGE_TYPE.OWNER_NEW_BOOKING,
      messageBody: message,
    });
  }

  async emitOwnerPaymentAwaitingConfirmation(bookingId: string) {
    const context = await resolveWhatsAppBookingContext(this.prisma, bookingId);

    if (!context?.ownerPhone) {
      return;
    }

    if (
      !(await this.whatsappService.shouldNotifyOwner(
        context.ownerId,
        "payment",
      ))
    ) {
      return;
    }

    const message = buildOwnerPaymentAwaitingFromContext(
      context,
      buildAppUrl(`/dashboard/bookings/${context.bookingId}/payment`),
    );

    await this.whatsappService.queueMessage({
      ownerId: context.ownerId,
      bookingId: context.bookingId,
      recipientPhone: context.ownerPhone,
      recipientType: WHATSAPP_RECIPIENT_TYPE.OWNER,
      messageType: WHATSAPP_MESSAGE_TYPE.OWNER_PAYMENT_AWAITING,
      messageBody: message,
    });
  }

  async emitOwnerBookingCancelled(bookingId: string) {
    const context = await resolveWhatsAppBookingContext(this.prisma, bookingId);

    if (!context?.ownerPhone) {
      return;
    }

    if (
      !(await this.whatsappService.shouldNotifyOwner(
        context.ownerId,
        "booking",
      ))
    ) {
      return;
    }

    await this.whatsappService.queueMessage({
      ownerId: context.ownerId,
      bookingId: context.bookingId,
      recipientPhone: context.ownerPhone,
      recipientType: WHATSAPP_RECIPIENT_TYPE.OWNER,
      messageType: WHATSAPP_MESSAGE_TYPE.OWNER_BOOKING_CANCELLED,
      messageBody: buildOwnerBookingCancelledMessage(),
    });
  }

  async emitCustomerBookingCreated(bookingId: string) {
    const context = await resolveWhatsAppBookingContext(this.prisma, bookingId);

    if (!context) {
      return;
    }

    await this.whatsappService.queueMessage({
      ownerId: context.ownerId,
      bookingId: context.bookingId,
      recipientPhone: context.customerPhone,
      recipientType: WHATSAPP_RECIPIENT_TYPE.CUSTOMER,
      messageType: WHATSAPP_MESSAGE_TYPE.CUSTOMER_BOOKING_CREATED,
      messageBody: buildCustomerBookingCreatedFromContext(context),
    });
  }

  async emitCustomerPaymentApproved(bookingId: string) {
    const context = await resolveWhatsAppBookingContext(this.prisma, bookingId);

    if (!context) {
      return;
    }

    const invoiceLink = buildAppUrl(
      `/gor/${context.gorSlug}/checkout/${context.bookingId}/invoice`,
    );

    await this.whatsappService.queueMessage({
      ownerId: context.ownerId,
      bookingId: context.bookingId,
      recipientPhone: context.customerPhone,
      recipientType: WHATSAPP_RECIPIENT_TYPE.CUSTOMER,
      messageType: WHATSAPP_MESSAGE_TYPE.CUSTOMER_PAYMENT_APPROVED,
      messageBody: buildCustomerPaymentApprovedFromContext(invoiceLink),
    });
  }

  async emitCustomerPaymentRejected(bookingId: string) {
    const context = await resolveWhatsAppBookingContext(this.prisma, bookingId);

    if (!context) {
      return;
    }

    await this.whatsappService.queueMessage({
      ownerId: context.ownerId,
      bookingId: context.bookingId,
      recipientPhone: context.customerPhone,
      recipientType: WHATSAPP_RECIPIENT_TYPE.CUSTOMER,
      messageType: WHATSAPP_MESSAGE_TYPE.CUSTOMER_PAYMENT_REJECTED,
      messageBody: buildCustomerPaymentRejectedMessage(),
    });
  }

  async emitCustomerBookingReminder(bookingId: string) {
    const context = await resolveWhatsAppBookingContext(this.prisma, bookingId);

    if (!context) {
      return;
    }

    if (
      !(await this.whatsappService.shouldNotifyCustomerReminder(
        context.ownerId,
      ))
    ) {
      return;
    }

    const alreadySent = await this.whatsappService.hasSuccessfulReminder(
      context.bookingId,
    );

    if (alreadySent) {
      return;
    }

    await this.whatsappService.queueMessage({
      ownerId: context.ownerId,
      bookingId: context.bookingId,
      recipientPhone: context.customerPhone,
      recipientType: WHATSAPP_RECIPIENT_TYPE.CUSTOMER,
      messageType: WHATSAPP_MESSAGE_TYPE.CUSTOMER_BOOKING_REMINDER,
      messageBody: buildCustomerBookingReminderFromContext(context),
    });
  }

  async emitOwnerSubscriptionActivated(ownerId: string, planLabel: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { id: ownerId },
      select: {
        gor: {
          select: {
            phone: true,
          },
        },
      },
    });

    const ownerPhone = owner?.gor?.phone;

    if (!ownerPhone) {
      return;
    }

    if (
      !(await this.whatsappService.shouldNotifyOwner(ownerId, "subscription"))
    ) {
      return;
    }

    await this.whatsappService.queueMessage({
      ownerId,
      recipientPhone: ownerPhone,
      recipientType: WHATSAPP_RECIPIENT_TYPE.OWNER,
      messageType: WHATSAPP_MESSAGE_TYPE.OWNER_SUBSCRIPTION_ACTIVATED,
      messageBody: buildOwnerSubscriptionActivatedMessage({
        planLabel,
        link: buildAppUrl("/dashboard/subscription"),
      }),
    });
  }
}

export function createWhatsAppService(
  dependencies: WhatsAppServiceDependencies,
): WhatsAppService {
  return new WhatsAppService(dependencies);
}

export function createWhatsAppEmitter(
  whatsappService: WhatsAppService,
  prisma: PrismaClient,
): WhatsAppEmitter {
  return new WhatsAppEmitter(whatsappService, prisma);
}
