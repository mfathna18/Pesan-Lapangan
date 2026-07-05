"use server";

import { getBookingService } from "@/domains/booking/actions/get-booking-service";
import {
  formatZodError,
  listBookingsSchema,
} from "@/domains/booking/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import type {
  BookingFilterOptions,
  ListBookingsResult,
} from "@/domains/booking/types";
import { parseVenueDateInput } from "@/domains/booking/utils/venue-date";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import { handleServerActionError } from "@/lib/server/actions";

export async function listBookingsAction(
  input: unknown,
): Promise<ActionResponse<ListBookingsResult>> {
  const session = await requireOwnerSession();

  const parsed = listBookingsSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const result = await getBookingService().listBookings({
      ownerId,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      sort: parsed.data.sort,
      courtId: parsed.data.courtId || undefined,
      status: parsed.data.status,
      bookingDate: parsed.data.bookingDate
        ? parseVenueDateInput(parsed.data.bookingDate)
        : undefined,
      bookingNumberSearch: parsed.data.bookingNumberSearch || undefined,
    });

    return actionSuccess(result);
  } catch (error) {
    return handleServerActionError("listBookingsAction", error, {
      fallbackMessage: "Gagal memuat booking.",
    });
  }
}

export async function getBookingFilterOptionsAction(): Promise<
  ActionResponse<BookingFilterOptions>
> {
  const session = await requireOwnerSession();

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const options = await getBookingService().getFilterOptions(ownerId);

    return actionSuccess(options);
  } catch (error) {
    return handleServerActionError("getBookingFilterOptionsAction", error, {
      fallbackMessage: "Gagal memuat filter booking.",
    });
  }
}
