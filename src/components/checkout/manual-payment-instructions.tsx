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
          Transfer ke rekening atau QRIS pemilik venue sesuai nominal di bawah.
        </p>
      </div>

      <div className="border-border space-y-5 rounded-[var(--radius-card)] border p-5">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Venue
          </p>
          <p className="font-medium">{instructions.venueName}</p>
        </div>

        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Jumlah Transfer
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {formatCurrency(totalPrice)}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">QRIS</p>
          {hasQris ? (
            <div className="bg-muted relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-[var(--radius-card)]">
              <Image
                src={instructions.qrisImageUrl!}
                alt={`QRIS ${instructions.venueName}`}
                fill
                className="object-contain p-3"
                sizes="220px"
              />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Belum diatur</p>
          )}
        </div>

        <p className="text-muted-foreground text-center text-sm">atau</p>

        <div className="space-y-2 text-sm">
          <p className="font-medium">Transfer Bank</p>
          <div className="grid gap-2">
            <div>
              <p className="text-muted-foreground text-xs">Bank</p>
              <p>{instructions.bankName ?? "Belum diatur"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Nomor Rekening</p>
              <p className="font-mono text-base font-semibold tracking-wide">
                {instructions.bankAccountNumber ?? "Belum diatur"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Atas Nama</p>
              <p>{instructions.bankAccountHolder ?? "Belum diatur"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
