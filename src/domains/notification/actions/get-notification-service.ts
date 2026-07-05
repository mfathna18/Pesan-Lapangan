import { createNotificationRepository } from "@/domains/notification/repositories/notification-repository";
import {
  createNotificationEmitter,
  createNotificationService,
} from "@/domains/notification/services/notification-service";
import { prisma } from "@/lib/db/prisma";

export function getNotificationService() {
  const notificationRepository = createNotificationRepository(prisma);

  return createNotificationService({
    prisma,
    notificationRepository,
  });
}

export function getNotificationEmitter() {
  const notificationRepository = createNotificationRepository(prisma);

  return createNotificationEmitter(prisma, notificationRepository);
}
