"use server";

import { getBookingService } from "@/domains/booking/actions/get-booking-service";
import { getCourtRepository } from "@/domains/booking/actions/get-court-repository";
import {
  createBookingSchema,
  formatZodError,
} from "@/domains/booking/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import { BookingValidationError } from "@/domains/booking/errors";
import type { BookingWithContact } from "@/domains/booking/repositories/booking-repository";
import { getSubscriptionService } from "@/domains/subscription/actions/get-subscription-service";
import { SubscriptionAccessDeniedError } from "@/domains/subscription/errors";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export async function createBookingAction(
  input: unknown,
): Promise<ActionResponse<BookingWithContact>> {
  const session = await requireOwnerSession();

  const parsed = createBookingSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);

    await getSubscriptionService().assertOwnerFeatureAccess(session.user.id);

    const isOwnedCourt = await getCourtRepository().isCourtOwnedByOwner(
      parsed.data.courtId,
      ownerId,
    );

    if (!isOwnedCourt) {
      return actionFailure("Court not found.");
    }

    const booking = await getBookingService().create(parsed.data);

    return actionSuccess(booking);
  } catch (error) {
    if (error instanceof SubscriptionAccessDeniedError) {
      return actionFailure(error.message);
    }

    if (error instanceof BookingValidationError) {
      return actionFailure(error.message);
    }

    return actionFailure("Failed to create booking.");
  }
}
