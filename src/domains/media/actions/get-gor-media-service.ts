import { createGorMediaService } from "@/domains/media/services/gor-media-service";
import { createGorRepository } from "@/domains/owner/repositories/gor-repository";
import { prisma } from "@/lib/db/prisma";

export function getGorMediaService() {
  return createGorMediaService(createGorRepository(prisma));
}
