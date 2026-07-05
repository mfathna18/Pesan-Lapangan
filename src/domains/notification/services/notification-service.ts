import {
  NOTIFICATION_CATEGORY,
  NOTIFICATION_DROPDOWN_LIMIT,
  NOTIFICATION_LIST_LIMIT,
  NOTIFICATION_TYPE,
  SUBSCRIPTION_EXPIRING_DEDUP_HOURS,
  SUBSCRIPTION_EXPIRING_REMINDER_DAYS,
} from "@/domains/notification/constants";
import type { NotificationRepository } from "@/domains/notification/repositories/notification-repository";
import type {
  ListOwnerNotificationsInput,
  OwnerNotificationItem,
  OwnerNotificationListResult,
} from "@/domains/notification/types";
import { SUBSCRIPTION_PLAN_LABELS } from "@/domains/subscription/constants";
import type { PrismaClient } from "@/generated/prisma/client";
import {
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";

type NotificationServiceDependencies = {
  prisma: PrismaClient;
  notificationRepository: NotificationRepository;
};

export class NotificationService {
  private readonly prisma: PrismaClient;
  private readonly notificationRepository: NotificationRepository;

  constructor({
    prisma,
    notificationRepository,
  }: NotificationServiceDependencies) {
    this.prisma = prisma;
    this.notificationRepository = notificationRepository;
  }

  async listForOwner(
    input: ListOwnerNotificationsInput,
  ): Promise<OwnerNotificationListResult> {
    await this.syncSubscriptionExpiringReminder(input.ownerId);

    const limit = input.limit ?? NOTIFICATION_LIST_LIMIT;
    const [items, unreadCount] = await Promise.all([
      this.notificationRepository.list({ ...input, limit }),
      this.notificationRepository.countUnread(input.ownerId),
    ]);

    return {
      items: items.map(toNotificationItem),
      unreadCount,
    };
  }

  async listRecentForOwner(
    ownerId: string,
  ): Promise<OwnerNotificationListResult> {
    return this.listForOwner({
      ownerId,
      filter: "all",
      limit: NOTIFICATION_DROPDOWN_LIMIT,
    });
  }

  async markAsRead(ownerId: string, notificationId: string) {
    await this.notificationRepository.markAsRead({ ownerId, notificationId });
  }

  async markAllAsRead(ownerId: string) {
    await this.notificationRepository.markAllAsRead(ownerId);
  }

  async syncSubscriptionExpiringReminder(ownerId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { ownerId },
      select: {
        status: true,
        expiresAt: true,
        plan: true,
      },
    });

    if (!subscription?.expiresAt) {
      return;
    }

    if (
      subscription.status !== "ACTIVE" &&
      subscription.status !== "GRACE_PERIOD"
    ) {
      return;
    }

    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (subscription.expiresAt.getTime() - now.getTime()) /
        (24 * 60 * 60 * 1000),
    );

    if (
      daysUntilExpiry <= 0 ||
      daysUntilExpiry > SUBSCRIPTION_EXPIRING_REMINDER_DAYS
    ) {
      return;
    }

    const dedupSince = new Date(
      now.getTime() - SUBSCRIPTION_EXPIRING_DEDUP_HOURS * 60 * 60 * 1000,
    );
    const alreadySent = await this.notificationRepository.hasRecentNotification(
      {
        ownerId,
        type: NOTIFICATION_TYPE.SUBSCRIPTION_EXPIRING,
        since: dedupSince,
      },
    );

    if (alreadySent) {
      return;
    }

    await this.notificationRepository.create({
      ownerId,
      type: NOTIFICATION_TYPE.SUBSCRIPTION_EXPIRING,
      category: NOTIFICATION_CATEGORY.SYSTEM,
      title: "Langganan Akan Berakhir",
      description: `Langganan ${SUBSCRIPTION_PLAN_LABELS[subscription.plan]} berakhir dalam ${daysUntilExpiry} hari. Perpanjang agar fitur venue tetap aktif.`,
      href: "/dashboard/subscription",
    });
  }
}

export function createNotificationService(
  dependencies: NotificationServiceDependencies,
): NotificationService {
  return new NotificationService(dependencies);
}

function toNotificationItem(notification: {
  id: string;
  type: OwnerNotificationItem["type"];
  category: OwnerNotificationItem["category"];
  title: string;
  description: string;
  href: string | null;
  bookingId: string | null;
  readAt: Date | null;
  createdAt: Date;
}): OwnerNotificationItem {
  return {
    id: notification.id,
    type: notification.type,
    category: notification.category,
    title: notification.title,
    description: notification.description,
    href: notification.href,
    bookingId: notification.bookingId,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}

export type BookingNotificationContext = {
  ownerId: string;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  courtName: string;
  startMinute: number;
  endMinute: number;
  amount: number;
};

export async function resolveBookingNotificationContext(
  prisma: PrismaClient,
  bookingId: string,
): Promise<BookingNotificationContext | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      bookingNumber: true,
      courtNameSnapshot: true,
      startMinute: true,
      endMinute: true,
      totalPrice: true,
      contact: {
        select: {
          customerName: true,
        },
      },
      court: {
        select: {
          gor: {
            select: {
              ownerId: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    return null;
  }

  return {
    ownerId: booking.court.gor.ownerId,
    bookingId: booking.id,
    bookingNumber: booking.bookingNumber,
    customerName: booking.contact?.customerName ?? "Pelanggan",
    courtName: booking.courtNameSnapshot,
    startMinute: booking.startMinute,
    endMinute: booking.endMinute,
    amount: booking.totalPrice,
  };
}

function buildBookingSummary(context: BookingNotificationContext): string {
  return `${context.customerName} · ${context.courtName} · ${formatTimeRange(context.startMinute, context.endMinute)}`;
}

export class NotificationEmitter {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async emitBookingCreated(bookingId: string) {
    const context = await resolveBookingNotificationContext(
      this.prisma,
      bookingId,
    );

    if (!context) {
      return;
    }

    await this.notificationRepository.create({
      ownerId: context.ownerId,
      type: NOTIFICATION_TYPE.BOOKING_CREATED,
      category: NOTIFICATION_CATEGORY.BOOKING,
      title: "Booking Baru",
      description: `${buildBookingSummary(context)} · ${formatCurrency(context.amount)}`,
      href: `/dashboard/bookings`,
      bookingId: context.bookingId,
    });
  }

  async emitPaymentAwaitingConfirmation(bookingId: string) {
    const context = await resolveBookingNotificationContext(
      this.prisma,
      bookingId,
    );

    if (!context) {
      return;
    }

    await this.notificationRepository.create({
      ownerId: context.ownerId,
      type: NOTIFICATION_TYPE.PAYMENT_AWAITING_CONFIRMATION,
      category: NOTIFICATION_CATEGORY.PAYMENT,
      title: "Pembayaran Menunggu Konfirmasi",
      description: `${context.customerName} menandai sudah membayar untuk ${context.bookingNumber}.`,
      href: `/dashboard/bookings/${context.bookingId}/payment`,
      bookingId: context.bookingId,
    });
  }

  async emitPaymentApproved(bookingId: string) {
    const context = await resolveBookingNotificationContext(
      this.prisma,
      bookingId,
    );

    if (!context) {
      return;
    }

    await this.notificationRepository.create({
      ownerId: context.ownerId,
      type: NOTIFICATION_TYPE.PAYMENT_APPROVED,
      category: NOTIFICATION_CATEGORY.PAYMENT,
      title: "Pembayaran Berhasil",
      description: `Pembayaran ${formatCurrency(context.amount)} untuk ${context.bookingNumber} dikonfirmasi.`,
      href: `/dashboard/bookings`,
      bookingId: context.bookingId,
    });
  }

  async emitPaymentRejected(bookingId: string) {
    const context = await resolveBookingNotificationContext(
      this.prisma,
      bookingId,
    );

    if (!context) {
      return;
    }

    await this.notificationRepository.create({
      ownerId: context.ownerId,
      type: NOTIFICATION_TYPE.PAYMENT_REJECTED,
      category: NOTIFICATION_CATEGORY.PAYMENT,
      title: "Pembayaran Ditolak",
      description: `Pembayaran ${context.bookingNumber} ditolak. Slot telah dibebaskan.`,
      href: `/dashboard/bookings`,
      bookingId: context.bookingId,
    });
  }

  async emitBookingCancelled(bookingId: string) {
    const context = await resolveBookingNotificationContext(
      this.prisma,
      bookingId,
    );

    if (!context) {
      return;
    }

    await this.notificationRepository.create({
      ownerId: context.ownerId,
      type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
      category: NOTIFICATION_CATEGORY.BOOKING,
      title: "Booking Dibatalkan",
      description: `${context.bookingNumber} dibatalkan · ${buildBookingSummary(context)}`,
      href: `/dashboard/bookings`,
      bookingId: context.bookingId,
    });
  }

  async emitSubscriptionActivated(ownerId: string, planLabel: string) {
    await this.notificationRepository.create({
      ownerId,
      type: NOTIFICATION_TYPE.SUBSCRIPTION_ACTIVATED,
      category: NOTIFICATION_CATEGORY.SYSTEM,
      title: "Langganan Aktif",
      description: `Langganan ${planLabel} berhasil diaktifkan. Semua fitur venue siap digunakan.`,
      href: "/dashboard/subscription",
    });
  }
}

export function createNotificationEmitter(
  prisma: PrismaClient,
  notificationRepository: NotificationRepository,
): NotificationEmitter {
  return new NotificationEmitter(prisma, notificationRepository);
}
