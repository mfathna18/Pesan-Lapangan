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
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export async function listBookingsAction(
  input: unknown,
): Promise<ActionResponse<ListBookingsResult>> {
  await requireOwnerSession();

  const parsed = listBookingsSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    const result = await getBookingService().listBookings({
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      sort: parsed.data.sort,
      courtId: parsed.data.courtId || undefined,
      status: parsed.data.status,
      bookingDate: parsed.data.bookingDate
        ? new Date(parsed.data.bookingDate)
        : undefined,
      bookingNumberSearch: parsed.data.bookingNumberSearch || undefined,
    });

    return actionSuccess(result);
  } catch {
    return actionFailure("Failed to load bookings.");
  }
}

export async function getBookingFilterOptionsAction(): Promise<
  ActionResponse<BookingFilterOptions>
> {
  await requireOwnerSession();

  try {
    const options = await getBookingService().getFilterOptions();

    return actionSuccess(options);
  } catch {
    return actionFailure("Failed to load booking filters.");
  }
}
