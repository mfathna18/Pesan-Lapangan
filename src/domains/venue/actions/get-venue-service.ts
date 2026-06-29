import { createVenueService } from "@/domains/venue/services/venue-service";
import { prisma } from "@/lib/db/prisma";

export function getVenueService() {
  return createVenueService(prisma);
}
