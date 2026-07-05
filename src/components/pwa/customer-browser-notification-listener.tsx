"use client";

import { useEffect, useRef } from "react";

import { createPushEmitter } from "@/domains/push/push-emitter";
import { PUSH_EVENT } from "@/domains/push/push-types";
import { CUSTOMER_PUSH_ENABLED_KEY } from "@/domains/push/push-types";

type CustomerCheckoutBrowserNotifierProps = {
  gorSlug: string;
  bookingId: string;
  latestPaymentStatus: string | null;
  bookingStatus: string;
  enabled?: boolean;
};

function isCustomerPushEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(CUSTOMER_PUSH_ENABLED_KEY) !== "false";
}

export function CustomerCheckoutBrowserNotifier({
  gorSlug,
  bookingId,
  latestPaymentStatus,
  bookingStatus,
  enabled = true,
}: CustomerCheckoutBrowserNotifierProps) {
  const previousStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !isCustomerPushEnabled()) {
      previousStatusRef.current = latestPaymentStatus;
      return;
    }

    const checkoutUrl = `/gor/${gorSlug}/checkout/${bookingId}`;
    const invoiceUrl = `/gor/${gorSlug}/checkout/${bookingId}/invoice`;

    async function maybeNotify() {
      const emitter = createPushEmitter();

      if (!emitter.canNotify()) {
        previousStatusRef.current = latestPaymentStatus;
        return;
      }

      const previousStatus = previousStatusRef.current;

      if (
        latestPaymentStatus === "PAID" &&
        previousStatus !== "PAID" &&
        bookingStatus === "CONFIRMED"
      ) {
        await emitter.emitCustomerEvent(PUSH_EVENT.CUSTOMER_PAYMENT_APPROVED, {
          url: invoiceUrl,
          tag: `customer-paid-${bookingId}`,
        });
      }

      if (latestPaymentStatus === "REJECTED" && previousStatus !== "REJECTED") {
        await emitter.emitCustomerEvent(PUSH_EVENT.CUSTOMER_PAYMENT_REJECTED, {
          url: checkoutUrl,
          tag: `customer-rejected-${bookingId}`,
        });
      }

      previousStatusRef.current = latestPaymentStatus;
    }

    void maybeNotify();
  }, [bookingId, bookingStatus, enabled, gorSlug, latestPaymentStatus]);

  return null;
}

type CustomerBookingReminderNotifierProps = {
  gorSlug: string;
  bookingId: string;
  bookingDate: string;
  startMinute: number;
  courtName: string;
  enabled?: boolean;
};

export function CustomerBookingReminderNotifier({
  gorSlug,
  bookingId,
  bookingDate,
  startMinute,
  courtName,
  enabled = true,
}: CustomerBookingReminderNotifierProps) {
  useEffect(() => {
    if (!enabled || !isCustomerPushEnabled()) {
      return;
    }

    const playAt = new Date(bookingDate);
    playAt.setUTCHours(Math.floor(startMinute / 60), startMinute % 60, 0, 0);

    const reminderAt = new Date(playAt.getTime() - 60 * 60 * 1000);
    const delay = reminderAt.getTime() - Date.now();

    if (delay <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        const emitter = createPushEmitter();

        if (!emitter.canNotify()) {
          return;
        }

        const hours = String(Math.floor(startMinute / 60)).padStart(2, "0");
        const minutes = String(startMinute % 60).padStart(2, "0");

        await emitter.emitCustomerEvent(PUSH_EVENT.CUSTOMER_BOOKING_REMINDER, {
          url: `/gor/${gorSlug}/checkout/${bookingId}/invoice`,
          body: `Jam ${hours}:${minutes} · ${courtName}`,
          tag: `customer-reminder-${bookingId}`,
        });
      })();
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [bookingDate, bookingId, courtName, enabled, gorSlug, startMinute]);

  return null;
}
