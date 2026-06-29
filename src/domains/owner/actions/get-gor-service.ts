import { createGorRepository } from "@/domains/owner/repositories/gor-repository";
import { createGorService } from "@/domains/owner/services/gor-service";
import { prisma } from "@/lib/db/prisma";

export function getGorService() {
  return createGorService(createGorRepository(prisma));
}
