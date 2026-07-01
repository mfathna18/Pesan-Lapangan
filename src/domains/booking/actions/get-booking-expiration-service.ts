import { prisma } from "@/lib/db/prisma";

import { createBookingExpirationService } from "../services/booking-expiration-service";

export function getBookingExpirationService() {
  return createBookingExpirationService(prisma);
}
