"use server";

import { getPriceRuleService } from "@/domains/booking/actions/get-price-rule-service";
import {
  formatZodError,
  updatePriceRuleSchema,
} from "@/domains/booking/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import {
  CourtNotFoundError,
  PriceRuleNotFoundError,
  PriceRuleValidationError,
} from "@/domains/booking/errors";
import type { OwnerPriceRuleListItem } from "@/domains/booking/types";
import { revalidatePublicVenueForOwnerId } from "@/domains/owner/utils/revalidate-owner-venue";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function updatePriceRuleAction(
  input: unknown,
): Promise<ActionResponse<OwnerPriceRuleListItem>> {
  const session = await requireOwnerSession();

  const parsed = updatePriceRuleSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const rule = await getPriceRuleService().updateRuleForOwnerCourt(
      ownerId,
      parsed.data.courtId,
      parsed.data.priceRuleId,
      parsed.data,
    );

    await revalidatePublicVenueForOwnerId(ownerId);

    return actionSuccess(rule);
  } catch (error) {
    return handleServerActionError("updatePriceRuleAction", error, {
      fallbackMessage: "Gagal memperbarui aturan harga.",
      knownErrors: [
        createKnownActionError(CourtNotFoundError),
        createKnownActionError(PriceRuleNotFoundError),
        createKnownActionError(PriceRuleValidationError),
      ],
    });
  }
}
