"use server";

import { getPriceRuleService } from "@/domains/booking/actions/get-price-rule-service";
import {
  deletePriceRuleSchema,
  formatZodError,
} from "@/domains/booking/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import {
  CourtNotFoundError,
  PriceRuleNotFoundError,
} from "@/domains/booking/errors";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function deletePriceRuleAction(
  input: unknown,
): Promise<ActionResponse<{ priceRuleId: string }>> {
  const session = await requireOwnerSession();

  const parsed = deletePriceRuleSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    await getPriceRuleService().deleteRuleForOwnerCourt(
      ownerId,
      parsed.data.courtId,
      parsed.data.priceRuleId,
    );

    return actionSuccess({ priceRuleId: parsed.data.priceRuleId });
  } catch (error) {
    return handleServerActionError("deletePriceRuleAction", error, {
      fallbackMessage: "Gagal menghapus aturan harga.",
      knownErrors: [
        createKnownActionError(CourtNotFoundError),
        createKnownActionError(PriceRuleNotFoundError),
      ],
    });
  }
}
