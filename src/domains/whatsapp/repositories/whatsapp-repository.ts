import type { PrismaClient } from "@/generated/prisma/client";
import type {
  OwnerWhatsAppSettingsData,
  UpdateOwnerWhatsAppSettingsInput,
  WhatsAppMessageStatus,
  WhatsAppMessageType,
  WhatsAppRecipientType,
} from "@/domains/whatsapp/whatsapp-types";

export type CreateWhatsAppLogInput = {
  ownerId?: string;
  bookingId?: string;
  recipientPhone: string;
  recipientType: WhatsAppRecipientType;
  messageType: WhatsAppMessageType;
  messageBody: string;
};

export type WhatsAppLogRecord = {
  id: string;
  ownerId: string | null;
  bookingId: string | null;
  recipientPhone: string;
  recipientType: WhatsAppRecipientType;
  messageType: WhatsAppMessageType;
  messageBody: string;
  status: WhatsAppMessageStatus;
  attemptCount: number;
  providerName: string | null;
  providerResponse: string | null;
  errorMessage: string | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class WhatsAppLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createPending(
    input: CreateWhatsAppLogInput,
  ): Promise<WhatsAppLogRecord> {
    return this.prisma.whatsAppMessageLog.create({
      data: {
        ownerId: input.ownerId,
        bookingId: input.bookingId,
        recipientPhone: input.recipientPhone,
        recipientType: input.recipientType,
        messageType: input.messageType,
        messageBody: input.messageBody,
        status: "PENDING",
        attemptCount: 0,
      },
    });
  }

  async findById(logId: string): Promise<WhatsAppLogRecord | null> {
    return this.prisma.whatsAppMessageLog.findUnique({
      where: { id: logId },
    });
  }

  async markRetrying(
    logId: string,
    attemptCount: number,
    errorMessage: string,
  ) {
    await this.prisma.whatsAppMessageLog.update({
      where: { id: logId },
      data: {
        status: "RETRYING",
        attemptCount,
        errorMessage,
      },
    });
  }

  async markSent(
    logId: string,
    input: {
      attemptCount: number;
      providerName: string;
      providerResponse: string;
    },
  ) {
    await this.prisma.whatsAppMessageLog.update({
      where: { id: logId },
      data: {
        status: "SENT",
        attemptCount: input.attemptCount,
        providerName: input.providerName,
        providerResponse: input.providerResponse,
        errorMessage: null,
        sentAt: new Date(),
      },
    });
  }

  async markFailed(
    logId: string,
    input: {
      attemptCount: number;
      providerName: string;
      providerResponse?: string;
      errorMessage: string;
    },
  ) {
    await this.prisma.whatsAppMessageLog.update({
      where: { id: logId },
      data: {
        status: "FAILED",
        attemptCount: input.attemptCount,
        providerName: input.providerName,
        providerResponse: input.providerResponse,
        errorMessage: input.errorMessage,
      },
    });
  }

  async hasSuccessfulMessage(input: {
    bookingId: string;
    messageType: WhatsAppMessageType;
  }): Promise<boolean> {
    const existing = await this.prisma.whatsAppMessageLog.findFirst({
      where: {
        bookingId: input.bookingId,
        messageType: input.messageType,
        status: "SENT",
      },
      select: { id: true },
    });

    return Boolean(existing);
  }

  async listRetryable(limit: number): Promise<WhatsAppLogRecord[]> {
    return this.prisma.whatsAppMessageLog.findMany({
      where: {
        status: {
          in: ["PENDING", "FAILED", "RETRYING"],
        },
        attemptCount: {
          lt: 3,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
    });
  }
}

export function createWhatsAppLogRepository(
  prisma: PrismaClient,
): WhatsAppLogRepository {
  return new WhatsAppLogRepository(prisma);
}

export class WhatsAppSettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getOrCreate(ownerId: string): Promise<OwnerWhatsAppSettingsData> {
    const settings = await this.prisma.ownerWhatsAppSettings.upsert({
      where: { ownerId },
      create: { ownerId },
      update: {},
    });

    return {
      enabled: settings.enabled,
      notifyBooking: settings.notifyBooking,
      notifyPayment: settings.notifyPayment,
      notifyReminder: settings.notifyReminder,
      notifySubscription: settings.notifySubscription,
    };
  }

  async update(
    ownerId: string,
    input: UpdateOwnerWhatsAppSettingsInput,
  ): Promise<OwnerWhatsAppSettingsData> {
    const settings = await this.prisma.ownerWhatsAppSettings.upsert({
      where: { ownerId },
      create: {
        ownerId,
        ...input,
      },
      update: input,
    });

    return {
      enabled: settings.enabled,
      notifyBooking: settings.notifyBooking,
      notifyPayment: settings.notifyPayment,
      notifyReminder: settings.notifyReminder,
      notifySubscription: settings.notifySubscription,
    };
  }
}

export function createWhatsAppSettingsRepository(
  prisma: PrismaClient,
): WhatsAppSettingsRepository {
  return new WhatsAppSettingsRepository(prisma);
}
