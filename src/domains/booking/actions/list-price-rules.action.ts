"use server";

import { getPriceRuleService } from "@/domains/booking/actions/get-price-rule-service";
import {
  formatZodError,
  listPriceRulesSchema,
} from "@/domains/booking/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import { CourtNotFoundError } from "@/domains/booking/errors";
import type { OwnerPriceRuleListItem } from "@/domains/booking/types";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

export async function listPriceRulesAction(
  input: unknown,
): Promise<ActionResponse<OwnerPriceRuleListItem[]>> {
  const session = await requireOwnerSession();

  const parsed = listPriceRulesSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const rules = await getPriceRuleService().listRulesForOwnerCourt(
      ownerId,
      parsed.data.courtId,
    );

    return actionSuccess(rules);
  } catch (error) {
    return handleServerActionError("listPriceRulesAction", error, {
      fallbackMessage: "Gagal memuat aturan harga.",
      knownErrors: [createKnownActionError(CourtNotFoundError)],
    });
  }
}
