import { createBookingService } from "@/domains/booking/services/booking-service";
import { prisma } from "@/lib/db/prisma";

export function getBookingService() {
  return createBookingService(prisma);
}
