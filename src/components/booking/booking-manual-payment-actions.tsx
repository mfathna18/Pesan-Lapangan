"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PAYMENT_REJECTION_REASONS,
  PAYMENT_STATUS,
} from "@/domains/payment/constants";
import {
  approveManualPaymentAction,
  rejectManualPaymentAction,
} from "@/domains/payment/actions/owner-manual-payment.action";

type BookingManualPaymentActionsProps = {
  bookingId: string;
  paymentStatus: string;
  onComplete?: () => void;
};

export function BookingManualPaymentActions({
  bookingId,
  paymentStatus,
  onComplete,
}: BookingManualPaymentActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reason, setReason] = useState<string>(PAYMENT_REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const canAct = paymentStatus === PAYMENT_STATUS.AWAITING_CONFIRMATION;
  const rejectionValue = reason === "other" ? customReason.trim() : reason;

  if (!canAct) {
    return null;
  }

  function handleApprove() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await approveManualPaymentAction(bookingId);

      if (!response.success) {
        setError(response.error);
        return;
      }

      setSuccess("Pembayaran berhasil dikonfirmasi.");
      onComplete?.();
      router.refresh();
    });
  }

  function handleReject() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await rejectManualPaymentAction({
        bookingId,
        reason: rejectionValue,
      });

      if (!response.success) {
        setError(response.error);
        return;
      }

      setSuccess("Pembayaran ditolak.");
      onComplete?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          className="w-full"
          disabled={isPending}
          onClick={handleApprove}
        >
          Konfirmasi Pembayaran
        </Button>
        <Button
          size="lg"
          variant="destructive"
          className="w-full"
          disabled={isPending || !rejectionValue}
          onClick={handleReject}
        >
          Tolak Pembayaran
        </Button>
      </div>

      <div className="space-y-3">
        <Label htmlFor={`reject-reason-${bookingId}`}>Alasan penolakan</Label>
        <Select
          value={reason}
          onValueChange={(value) => setReason(value ?? reason)}
        >
          <SelectTrigger id={`reject-reason-${bookingId}`}>
            <SelectValue placeholder="Pilih alasan" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_REJECTION_REASONS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
            <SelectItem value="other">Lainnya</SelectItem>
          </SelectContent>
        </Select>
        {reason === "other" ? (
          <Textarea
            value={customReason}
            onChange={(event) => setCustomReason(event.target.value)}
            placeholder="Tulis alasan penolakan"
            rows={3}
          />
        ) : null}
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-700" role="status">
          {success}
        </p>
      ) : null}
    </div>
  );
}
