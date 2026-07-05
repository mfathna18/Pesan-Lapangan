import { NextResponse } from "next/server";

import { findBookingsDueForReminder } from "@/domains/whatsapp/services/booking-reminder-service";
import { dispatchCustomerBookingReminder } from "@/domains/whatsapp/utils/whatsapp-dispatch";
import { env } from "@/config/env";
import { prisma } from "@/lib/db/prisma";
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
    const bookingIds = await findBookingsDueForReminder(prisma);

    for (const bookingId of bookingIds) {
      await dispatchCustomerBookingReminder(bookingId);
    }

    logInfo("Booking reminder WhatsApp dispatch completed", {
      reminderCount: bookingIds.length,
    });

    return NextResponse.json({
      ok: true,
      reminderCount: bookingIds.length,
    });
  } catch (error) {
    logError("Booking reminder WhatsApp dispatch failed", error);

    return NextResponse.json(
      { error: "Failed to dispatch booking reminders" },
      { status: 500 },
    );
  }
}
