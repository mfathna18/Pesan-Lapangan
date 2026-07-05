import { NextResponse } from "next/server";

import { getWhatsAppService } from "@/domains/whatsapp/actions/get-whatsapp-service";
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
    const result = await getWhatsAppService().processRetryableMessages(50);

    logInfo("WhatsApp retry queue processed", result);

    return NextResponse.json({
      ok: true,
      queuedCount: result.queuedCount,
    });
  } catch (error) {
    logError("WhatsApp retry queue processing failed", error);

    return NextResponse.json(
      { error: "Failed to process WhatsApp retry queue" },
      { status: 500 },
    );
  }
}
