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
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";
import { getNotificationEmitter } from "@/domains/notification/actions/get-notification-service";
import { dispatchOwnerNewBooking } from "@/domains/whatsapp/utils/whatsapp-dispatch";

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
      return actionFailure("Lapangan tidak ditemukan.");
    }

    const booking = await getBookingService().create(parsed.data);

    await getNotificationEmitter().emitBookingCreated(booking.id);
    await dispatchOwnerNewBooking(booking.id);

    return actionSuccess(booking);
  } catch (error) {
    return handleServerActionError("createBookingAction", error, {
      fallbackMessage: "Gagal membuat booking.",
      knownErrors: [
        createKnownActionError(SubscriptionAccessDeniedError),
        createKnownActionError(BookingValidationError),
      ],
    });
  }
}
