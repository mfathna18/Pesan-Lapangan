import { getWhatsAppEmitter } from "@/domains/whatsapp/actions/get-whatsapp-service";
import { logError } from "@/lib/server/logger";

export async function safelyDispatchWhatsApp(
  task: () => Promise<void>,
): Promise<void> {
  try {
    await task();
  } catch (error) {
    logError("WhatsApp dispatch failed", error);
  }
}

export async function dispatchOwnerNewBooking(bookingId: string) {
  await safelyDispatchWhatsApp(() =>
    getWhatsAppEmitter().emitOwnerNewBooking(bookingId),
  );
}

export async function dispatchOwnerPaymentAwaiting(bookingId: string) {
  await safelyDispatchWhatsApp(() =>
    getWhatsAppEmitter().emitOwnerPaymentAwaitingConfirmation(bookingId),
  );
}

export async function dispatchOwnerBookingCancelled(bookingId: string) {
  await safelyDispatchWhatsApp(() =>
    getWhatsAppEmitter().emitOwnerBookingCancelled(bookingId),
  );
}

export async function dispatchCustomerBookingCreated(bookingId: string) {
  await safelyDispatchWhatsApp(() =>
    getWhatsAppEmitter().emitCustomerBookingCreated(bookingId),
  );
}

export async function dispatchCustomerPaymentApproved(bookingId: string) {
  await safelyDispatchWhatsApp(() =>
    getWhatsAppEmitter().emitCustomerPaymentApproved(bookingId),
  );
}

export async function dispatchCustomerPaymentRejected(bookingId: string) {
  await safelyDispatchWhatsApp(() =>
    getWhatsAppEmitter().emitCustomerPaymentRejected(bookingId),
  );
}

export async function dispatchCustomerBookingReminder(bookingId: string) {
  await safelyDispatchWhatsApp(() =>
    getWhatsAppEmitter().emitCustomerBookingReminder(bookingId),
  );
}

export async function dispatchOwnerSubscriptionActivated(
  ownerId: string,
  planLabel: string,
) {
  await safelyDispatchWhatsApp(() =>
    getWhatsAppEmitter().emitOwnerSubscriptionActivated(ownerId, planLabel),
  );
}
