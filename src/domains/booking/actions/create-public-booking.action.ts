"use server";

import { getAvailabilityService } from "@/domains/availability/actions/get-availability-service";
import { getBookingService } from "@/domains/booking/actions/get-booking-service";
import { getCourtService } from "@/domains/booking/actions/get-court-service";
import {
  createPublicBookingSchema,
  formatZodError,
} from "@/domains/booking/actions/schemas";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/booking/actions/types";
import {
  BOOKING_DURATION_INTERVAL_MINUTES,
  BOOKING_SLOT_UNAVAILABLE_MESSAGE,
} from "@/domains/booking/constants";
import {
  BookingValidationError,
  CourtNotFoundError,
} from "@/domains/booking/errors";
import type { BookingWithContact } from "@/domains/booking/repositories/booking-repository";
import { SUBSCRIPTION_BOOKING_RECEIVING_DENIED_MESSAGE } from "@/domains/subscription/constants";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

function isSlotStillAvailable(
  slots: Awaited<
    ReturnType<ReturnType<typeof getAvailabilityService>["getSlotGrid"]>
  >,
  startMinute: number,
) {
  return slots.some(
    (slot) => slot.startMinute === startMinute && slot.available,
  );
}

function mapBookingValidationError(error: BookingValidationError): string {
  if (
    error.message.includes("price rule") ||
    error.message.includes("unavailable") ||
    error.message === SUBSCRIPTION_BOOKING_RECEIVING_DENIED_MESSAGE
  ) {
    return BOOKING_SLOT_UNAVAILABLE_MESSAGE;
  }

  return error.message;
}

export async function createPublicBookingAction(
  input: unknown,
): Promise<ActionResponse<BookingWithContact>> {
  const parsed = createPublicBookingSchema.safeParse(input);

  if (!parsed.success) {
    return actionFailure(formatZodError(parsed.error));
  }

  try {
    await getCourtService().getPublicCourtDetail(
      parsed.data.gorSlug,
      parsed.data.courtId,
    );
  } catch (error) {
    return handleServerActionError(
      "createPublicBookingAction.loadCourt",
      error,
      {
        fallbackMessage: "Gagal memuat lapangan.",
        knownErrors: [
          createKnownActionError(
            CourtNotFoundError,
            "Lapangan tidak ditemukan.",
          ),
        ],
      },
    );
  }

  const bookingDate = new Date(`${parsed.data.bookingDate}T00:00:00`);

  if (Number.isNaN(bookingDate.getTime())) {
    return actionFailure("Tanggal booking tidak valid.");
  }

  const slots = await getAvailabilityService().getSlotGrid({
    courtId: parsed.data.courtId,
    date: bookingDate,
  });

  if (!isSlotStillAvailable(slots, parsed.data.startMinute)) {
    return actionFailure(BOOKING_SLOT_UNAVAILABLE_MESSAGE);
  }

  try {
    const booking = await getBookingService().create({
      courtId: parsed.data.courtId,
      bookingDate,
      startMinute: parsed.data.startMinute,
      durationMinute: BOOKING_DURATION_INTERVAL_MINUTES,
      contact: {
        customerName: parsed.data.contact.customerName,
        customerPhone: parsed.data.contact.customerPhone.replace(/[\s-]/g, ""),
        note: parsed.data.contact.note ?? null,
      },
    });

    return actionSuccess(booking);
  } catch (error) {
    return handleServerActionError("createPublicBookingAction.create", error, {
      fallbackMessage: "Gagal membuat booking.",
      knownErrors: [
        createKnownActionError(BookingValidationError, (validationError) =>
          mapBookingValidationError(validationError),
        ),
      ],
    });
  }
}
