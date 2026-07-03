"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ManualPaymentInstructions } from "@/components/checkout/manual-payment-instructions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import {
  PAYMENT_REJECTION_REASONS,
  PAYMENT_STATUS,
} from "@/domains/payment/constants";
import {
  approveManualPaymentAction,
  rejectManualPaymentAction,
} from "@/domains/payment/actions/owner-manual-payment.action";
import type { ManualPaymentDetailData } from "@/domains/payment/types";
import {
  formatBookingDate,
  formatCurrency,
  formatTimeRange,
} from "@/domains/booking/utils/booking-display";
import { formatTimeSince } from "@/domains/payment/utils/customer-payment-status";
import { layout } from "@/lib/design-system";

type OwnerPaymentConfirmationPanelProps = {
  detail: ManualPaymentDetailData;
};

export function OwnerPaymentConfirmationPanel({
  detail,
}: OwnerPaymentConfirmationPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reason, setReason] = useState<string>(PAYMENT_REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const canAct = detail.status === PAYMENT_STATUS.AWAITING_CONFIRMATION;
  const rejectionValue = reason === "other" ? customReason.trim() : reason;

  function handleApprove() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await approveManualPaymentAction(detail.bookingId);

      if (!response.success) {
        setError(response.error);
        return;
      }

      setSuccess("Pembayaran berhasil dikonfirmasi.");
      router.refresh();
    });
  }

  function handleReject() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await rejectManualPaymentAction({
        bookingId: detail.bookingId,
        reason: rejectionValue,
      });

      if (!response.success) {
        setError(response.error);
        return;
      }

      setSuccess("Pembayaran ditolak.");
      router.refresh();
    });
  }

  return (
    <div className={layout.page}>
      <PageHeader
        eyebrow="Konfirmasi Pembayaran"
        title={detail.bookingNumber}
        description="Periksa pembayaran pelanggan sebelum mengonfirmasi booking."
        actions={
          detail.showReminder ? (
            <Badge
              variant="outline"
              className="border-amber-500 text-amber-700"
            >
              Segera periksa pembayaran ini
            </Badge>
          ) : null
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Booking</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Pelanggan:</span>{" "}
              {detail.customerName}
            </p>
            <p>
              <span className="text-muted-foreground">WhatsApp:</span>{" "}
              {detail.customerPhone}
            </p>
            <p>
              <span className="text-muted-foreground">Venue:</span>{" "}
              {detail.venueName}
            </p>
            <p>
              <span className="text-muted-foreground">Lapangan:</span>{" "}
              {detail.courtName}
            </p>
            <p>
              <span className="text-muted-foreground">Tanggal:</span>{" "}
              {formatBookingDate(detail.bookingDate)}
            </p>
            <p>
              <span className="text-muted-foreground">Waktu:</span>{" "}
              {formatTimeRange(detail.startMinute, detail.endMinute)}
            </p>
            <p>
              <span className="text-muted-foreground">Durasi:</span>{" "}
              {detail.durationMinute} menit
            </p>
            <p className="font-semibold">{formatCurrency(detail.amount)}</p>
            {detail.customerConfirmedAt ? (
              <p className="sm:col-span-2">
                <span className="text-muted-foreground">
                  Waktu konfirmasi pelanggan:
                </span>{" "}
                {formatTimeSince(detail.customerConfirmedAt)}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <ManualPaymentInstructions
          instructions={detail.ownerPaymentInstructions}
          totalPrice={detail.amount}
        />
      </div>

      {canAct ? (
        <Card>
          <CardHeader>
            <CardTitle>Tindakan Owner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="flex-1"
                disabled={isPending}
                onClick={handleApprove}
              >
                Konfirmasi Pembayaran
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="flex-1"
                disabled={isPending || !rejectionValue}
                onClick={handleReject}
              >
                Tolak Pembayaran
              </Button>
            </div>

            <div className="space-y-3">
              <Label htmlFor="reject-reason">Alasan penolakan</Label>
              <Select
                value={reason}
                onValueChange={(value) => setReason(value ?? reason)}
              >
                <SelectTrigger id="reject-reason">
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
          </CardContent>
        </Card>
      ) : null}

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
