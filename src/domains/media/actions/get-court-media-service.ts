import { createCourtMediaService } from "@/domains/media/services/court-media-service";
import { createCourtRepository } from "@/domains/booking/repositories/court-repository";
import { getOwnerIdByUserId } from "@/lib/auth/get-owner-id";
import { prisma } from "@/lib/db/prisma";

export function getCourtMediaService() {
  return createCourtMediaService(createCourtRepository(prisma), {
    findOwnerIdByUserId: getOwnerIdByUserId,
  });
}
