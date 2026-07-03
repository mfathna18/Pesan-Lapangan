"use server";

import { revalidatePath } from "next/cache";

import { getManualPaymentService } from "@/domains/payment/actions/get-manual-payment-service";
import { actionFailure, actionSuccess } from "@/domains/payment/actions/types";
import {
  ManualPaymentAccessDeniedError,
  ManualPaymentNotFoundError,
  PaymentValidationError,
} from "@/domains/payment/errors";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import { prisma } from "@/lib/db/prisma";

async function revalidatePublicCheckout(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      court: {
        select: {
          gor: {
            select: { slug: true },
          },
        },
      },
    },
  });

  if (booking) {
    revalidatePath(`/gor/${booking.court.gor.slug}/checkout/${bookingId}`);
  }
}

export async function approveManualPaymentAction(bookingId: string) {
  try {
    const session = await requireOwnerSession();
    const ownerId = await requireOwnerId(session.user.id);

    await getManualPaymentService().approvePayment({
      ownerId,
      ownerUserId: session.user.id,
      bookingId,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${bookingId}/payment`);
    await revalidatePublicCheckout(bookingId);

    return actionSuccess({ approved: true });
  } catch (error) {
    if (error instanceof PaymentValidationError) {
      return actionFailure(error.message);
    }

    if (
      error instanceof ManualPaymentNotFoundError ||
      error instanceof ManualPaymentAccessDeniedError
    ) {
      return actionFailure("Pembayaran tidak ditemukan.");
    }

    return actionFailure("Gagal mengonfirmasi pembayaran.");
  }
}

export async function rejectManualPaymentAction(input: {
  bookingId: string;
  reason: string;
}) {
  try {
    const session = await requireOwnerSession();
    const ownerId = await requireOwnerId(session.user.id);

    await getManualPaymentService().rejectPayment({
      ownerId,
      ownerUserId: session.user.id,
      bookingId: input.bookingId,
      reason: input.reason,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");
    revalidatePath(`/dashboard/bookings/${input.bookingId}/payment`);
    await revalidatePublicCheckout(input.bookingId);

    return actionSuccess({ rejected: true });
  } catch (error) {
    if (error instanceof PaymentValidationError) {
      return actionFailure(error.message);
    }

    if (
      error instanceof ManualPaymentNotFoundError ||
      error instanceof ManualPaymentAccessDeniedError
    ) {
      return actionFailure("Pembayaran tidak ditemukan.");
    }

    return actionFailure("Gagal menolak pembayaran.");
  }
}

export async function listAwaitingManualPaymentsAction() {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  return getManualPaymentService().listAwaitingConfirmation(ownerId);
}
