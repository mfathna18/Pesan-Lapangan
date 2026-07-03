import { notFound } from "next/navigation";

import { OwnerPaymentConfirmationPanel } from "@/components/dashboard/owner-payment-confirmation-panel";
import { createPageMetadata } from "@/config/page-metadata";
import { getManualPaymentService } from "@/domains/payment/actions/get-manual-payment-service";
import { ManualPaymentNotFoundError } from "@/domains/payment/errors";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

type OwnerPaymentConfirmationPageProps = {
  params: Promise<{ bookingId: string }>;
};

export async function generateMetadata({
  params,
}: OwnerPaymentConfirmationPageProps) {
  const { bookingId } = await params;

  return createPageMetadata(
    "Konfirmasi Pembayaran",
    `Konfirmasi pembayaran manual untuk booking ${bookingId}.`,
  );
}

export default async function OwnerPaymentConfirmationPage({
  params,
}: OwnerPaymentConfirmationPageProps) {
  const { bookingId } = await params;
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);

  try {
    const detail = await getManualPaymentService().getOwnerPaymentDetail({
      ownerId,
      bookingId,
    });

    return <OwnerPaymentConfirmationPanel detail={detail} />;
  } catch (error) {
    if (error instanceof ManualPaymentNotFoundError) {
      notFound();
    }

    throw error;
  }
}
