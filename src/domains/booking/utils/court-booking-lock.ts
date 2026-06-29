import { startOfDay } from "@/domains/availability/utils/time-interval";
import type { PrismaClient } from "@/generated/prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

export async function acquireCourtBookingDateLock(
  tx: TransactionClient,
  courtId: string,
  bookingDate: Date,
): Promise<void> {
  const lockKey = `${courtId}:${startOfDay(bookingDate).toISOString()}`;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
}
