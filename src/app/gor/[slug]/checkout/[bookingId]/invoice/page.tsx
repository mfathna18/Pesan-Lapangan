import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicInvoiceUnavailable } from "@/components/checkout/public-invoice-unavailable";
import { PublicInvoiceView } from "@/components/checkout/public-invoice-view";
import { CustomerBookingReminderNotifier } from "@/components/pwa/customer-browser-notification-listener";
import { getPublicInvoiceService } from "@/domains/invoice/actions/get-public-invoice-service";
import { getPublicCheckoutService } from "@/domains/payment/actions/get-public-checkout-service";
import { PublicCheckoutNotFoundError } from "@/domains/payment/errors";

type PublicInvoicePageProps = {
  params: Promise<{
    slug: string;
    bookingId: string;
  }>;
};

export async function generateMetadata({
  params,
}: PublicInvoicePageProps): Promise<Metadata> {
  const { slug, bookingId } = await params;

  const invoice = await getPublicInvoiceService().findInvoiceForCheckout(
    slug,
    bookingId,
  );

  if (!invoice) {
    return {
      title: "Invoice",
    };
  }

  return {
    title: `Invoice ${invoice.invoiceNumber}`,
    description: `Invoice booking ${invoice.bookingNumber} di ${invoice.venueName}.`,
  };
}

export default async function PublicInvoicePage({
  params,
}: PublicInvoicePageProps) {
  const { slug, bookingId } = await params;

  let checkout;

  try {
    checkout = await getPublicCheckoutService().getCheckoutData(
      slug,
      bookingId,
    );
  } catch (error) {
    if (error instanceof PublicCheckoutNotFoundError) {
      notFound();
    }

    throw error;
  }

  const invoice = await getPublicInvoiceService().findInvoiceForCheckout(
    slug,
    bookingId,
  );

  if (!invoice) {
    return (
      <PublicInvoiceUnavailable
        venueSlug={checkout.venueSlug}
        venueName={checkout.venueName}
        bookingId={bookingId}
      />
    );
  }

  return (
    <>
      <PublicInvoiceView invoice={invoice} />
      <CustomerBookingReminderNotifier
        gorSlug={invoice.venueSlug}
        bookingId={invoice.bookingId}
        bookingDate={invoice.bookingDate}
        startMinute={invoice.startMinute}
        courtName={invoice.courtName}
      />
    </>
  );
}
