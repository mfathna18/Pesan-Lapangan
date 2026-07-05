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
import { getNotificationEmitter } from "@/domains/notification/actions/get-notification-service";

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
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  try {
    await getManualPaymentService().approvePayment({
      ownerId,
      ownerUserId: session.user.id,
      bookingId,
    });

    await getNotificationEmitter().emitPaymentApproved(bookingId);

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
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  try {
    await getManualPaymentService().rejectPayment({
      ownerId,
      ownerUserId: session.user.id,
      bookingId: input.bookingId,
      reason: input.reason,
    });

    await getNotificationEmitter().emitPaymentRejected(input.bookingId);

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
