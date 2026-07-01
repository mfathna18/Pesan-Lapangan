"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CheckoutSuccessDetails } from "@/components/checkout/checkout-success-details";
import { getPublicCheckoutStatusAction } from "@/domains/payment/actions/get-public-checkout-status.action";
import type { PublicCheckoutData } from "@/domains/payment/types";

const INVOICE_POLL_INTERVAL_MS = 2000;
const INVOICE_POLL_MAX_ATTEMPTS = 15;

type CheckoutSuccessPollerProps = {
  gorSlug: string;
  bookingId: string;
  initialCheckout: PublicCheckoutData;
};

export function CheckoutSuccessPoller({
  gorSlug,
  bookingId,
  initialCheckout,
}: CheckoutSuccessPollerProps) {
  const router = useRouter();
  const [checkout, setCheckout] = useState(initialCheckout);

  useEffect(() => {
    if (checkout.invoiceNumber) {
      return;
    }

    let attempts = 0;

    const intervalId = window.setInterval(() => {
      attempts += 1;

      if (attempts > INVOICE_POLL_MAX_ATTEMPTS) {
        window.clearInterval(intervalId);
        return;
      }

      void (async () => {
        const response = await getPublicCheckoutStatusAction({
          gorSlug,
          bookingId,
        });

        if (!response.success) {
          return;
        }

        if (!response.data.hasPaidPayment) {
          router.replace(`/gor/${gorSlug}/checkout/${bookingId}`);
          return;
        }

        setCheckout(response.data);

        if (response.data.invoiceNumber) {
          window.clearInterval(intervalId);
        }
      })();
    }, INVOICE_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [bookingId, checkout.invoiceNumber, gorSlug, router]);

  return <CheckoutSuccessDetails checkout={checkout} />;
}
