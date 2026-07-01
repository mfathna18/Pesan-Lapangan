import { NextResponse } from "next/server";

import { getBookingExpirationService } from "@/domains/booking/actions/get-booking-expiration-service";
import { env } from "@/config/env";
import { logError, logInfo } from "@/lib/server/logger";

export const runtime = "nodejs";

function isAuthorizedCronRequest(request: Request): boolean {
  const authorization = request.headers.get("authorization");

  return authorization === `Bearer ${env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getBookingExpirationService().expirePendingBookings();

    logInfo("Expired pending bookings cleanup completed", result);

    return NextResponse.json({
      ok: true,
      expiredCount: result.expiredCount,
    });
  } catch (error) {
    logError("Expired pending bookings cleanup failed", error);

    return NextResponse.json(
      { error: "Failed to expire pending bookings" },
      { status: 500 },
    );
  }
}
