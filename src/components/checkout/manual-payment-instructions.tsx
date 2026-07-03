import Image from "next/image";

import type { OwnerPaymentInstructions } from "@/domains/payment/types";
import { formatCurrency } from "@/domains/booking/utils/booking-display";
import { customerLayout } from "@/lib/customer-layout";

type ManualPaymentInstructionsProps = {
  instructions: OwnerPaymentInstructions;
  totalPrice: number;
};

export function ManualPaymentInstructions({
  instructions,
  totalPrice,
}: ManualPaymentInstructionsProps) {
  const hasBank =
    instructions.bankName &&
    instructions.bankAccountNumber &&
    instructions.bankAccountHolder;
  const hasQris = Boolean(instructions.qrisImageUrl);

  return (
    <section
      className={customerLayout.checkoutSection}
      aria-labelledby="manual-payment"
    >
      <div className="space-y-2">
        <h2
          id="manual-payment"
          className="text-lg font-semibold tracking-tight"
        >
          Pembayaran
        </h2>
        <p className="text-muted-foreground text-sm">
          Silakan transfer sesuai nominal booking ke rekening atau QRIS pemilik
          venue.
        </p>
      </div>

      <div className="border-border space-y-4 rounded-[var(--radius-card)] border p-5">
        <p className="font-medium">{instructions.venueName}</p>
        <p className="text-2xl font-bold tabular-nums">
          {formatCurrency(totalPrice)}
        </p>

        {hasQris ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">QRIS</p>
            <div className="bg-muted relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-[var(--radius-card)]">
              <Image
                src={instructions.qrisImageUrl!}
                alt={`QRIS ${instructions.venueName}`}
                fill
                className="object-contain p-3"
                sizes="220px"
              />
            </div>
          </div>
        ) : null}

        {hasQris && hasBank ? (
          <p className="text-muted-foreground text-center text-sm">atau</p>
        ) : null}

        {hasBank ? (
          <div className="space-y-1 text-sm">
            <p className="font-medium">Transfer Bank</p>
            <p>{instructions.bankName}</p>
            <p className="font-mono text-base font-semibold tracking-wide">
              {instructions.bankAccountNumber}
            </p>
            <p>a.n. {instructions.bankAccountHolder}</p>
          </div>
        ) : null}

        {!hasBank && !hasQris ? (
          <p className="text-muted-foreground text-sm">
            Informasi pembayaran belum diatur oleh pemilik venue. Hubungi venue
            untuk detail transfer.
          </p>
        ) : null}
      </div>
    </section>
  );
}
