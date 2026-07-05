import type {
  CreateOwnerNotificationInput,
  ListOwnerNotificationsInput,
} from "@/domains/notification/types";
import type {
  NotificationCategory,
  NotificationType,
  PrismaClient,
} from "@/generated/prisma/client";

export class NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateOwnerNotificationInput) {
    return this.prisma.ownerNotification.create({
      data: {
        ownerId: input.ownerId,
        type: input.type,
        category: input.category,
        title: input.title,
        description: input.description,
        href: input.href ?? null,
        bookingId: input.bookingId ?? null,
      },
    });
  }

  async countUnread(ownerId: string): Promise<number> {
    return this.prisma.ownerNotification.count({
      where: {
        ownerId,
        readAt: null,
      },
    });
  }

  async list(input: ListOwnerNotificationsInput) {
    const where = this.buildWhere(input.ownerId, input.filter);

    return this.prisma.ownerNotification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: input.limit,
    });
  }

  async markAsRead(input: { ownerId: string; notificationId: string }) {
    return this.prisma.ownerNotification.updateMany({
      where: {
        id: input.notificationId,
        ownerId: input.ownerId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(ownerId: string) {
    return this.prisma.ownerNotification.updateMany({
      where: {
        ownerId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  async hasRecentNotification(input: {
    ownerId: string;
    type: NotificationType;
    since: Date;
  }): Promise<boolean> {
    const existing = await this.prisma.ownerNotification.findFirst({
      where: {
        ownerId: input.ownerId,
        type: input.type,
        createdAt: {
          gte: input.since,
        },
      },
      select: {
        id: true,
      },
    });

    return existing != null;
  }

  private buildWhere(
    ownerId: string,
    filter: ListOwnerNotificationsInput["filter"],
  ) {
    switch (filter) {
      case "unread":
        return { ownerId, readAt: null };
      case "booking":
        return { ownerId, category: "BOOKING" as NotificationCategory };
      case "payment":
        return { ownerId, category: "PAYMENT" as NotificationCategory };
      case "system":
        return { ownerId, category: "SYSTEM" as NotificationCategory };
      case "all":
      default:
        return { ownerId };
    }
  }
}

export function createNotificationRepository(
  prisma: PrismaClient,
): NotificationRepository {
  return new NotificationRepository(prisma);
}
