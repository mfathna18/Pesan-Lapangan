import type { WhatsAppLogEvent } from "@/domains/whatsapp/whatsapp-types";
import { logError, logInfo } from "@/lib/server/logger";

export function logWhatsAppEvent(event: WhatsAppLogEvent): void {
  switch (event.type) {
    case "success":
      logInfo("WhatsApp message sent", {
        logId: event.logId,
        provider: event.providerName,
        response: event.response,
      });
      break;
    case "failed":
      logError("WhatsApp message failed", undefined, {
        logId: event.logId,
        provider: event.providerName,
        error: event.error,
      });
      break;
    case "retry":
      logInfo("WhatsApp message retry scheduled", {
        logId: event.logId,
        attempt: event.attempt,
        error: event.error,
      });
      break;
  }
}
