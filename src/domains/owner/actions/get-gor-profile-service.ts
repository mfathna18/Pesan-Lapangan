import { createGorProfileService } from "@/domains/owner/services/gor-profile-service";
import { createGorRepository } from "@/domains/owner/repositories/gor-repository";
import { prisma } from "@/lib/db/prisma";

export function getGorProfileService() {
  return createGorProfileService(createGorRepository(prisma));
}
