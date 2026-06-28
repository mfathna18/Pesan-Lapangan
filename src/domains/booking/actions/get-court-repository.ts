import { createCourtRepository } from "@/domains/booking/repositories/court-repository";
import { prisma } from "@/lib/db/prisma";

export function getCourtRepository() {
  return createCourtRepository(prisma);
}
