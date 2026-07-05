import { getSubscriptionService } from "@/domains/subscription/actions/get-subscription-service";
import { SubscriptionAccessDeniedError } from "@/domains/subscription/errors";
import { getOwnerApiSession } from "@/lib/auth/get-owner-api-session";

import {
  createExportErrorResponse,
  createExportUnauthorizedResponse,
} from "./export-http";

export async function requireOwnerExportSession() {
  const session = await getOwnerApiSession();

  if (!session) {
    return {
      session: null,
      errorResponse: createExportUnauthorizedResponse(),
    };
  }

  try {
    await getSubscriptionService().assertOwnerFeatureAccess(session.user.id);
  } catch (error) {
    if (error instanceof SubscriptionAccessDeniedError) {
      return {
        session: null,
        errorResponse: createExportErrorResponse(
          "Langganan tidak aktif. Perpanjang langganan untuk mengekspor data.",
          403,
        ),
      };
    }

    throw error;
  }

  return {
    session,
    errorResponse: null,
  };
}
