"use client";

import { useEffect, useState } from "react";

type BookingExpirationCountdownProps = {
  expiresAt: string;
  onExpired?: () => void;
};

export function formatCheckoutCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function BookingExpirationCountdown({
  expiresAt,
  onExpired,
}: BookingExpirationCountdownProps) {
  const expiresAtMs = new Date(expiresAt).getTime();
  const [remainingMs, setRemainingMs] = useState(
    () => expiresAtMs - Date.now(),
  );

  useEffect(() => {
    const tick = () => {
      const nextRemainingMs = expiresAtMs - Date.now();
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs <= 0) {
        onExpired?.();
      }
    };

    tick();

    const intervalId = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [expiresAtMs, onExpired]);

  if (remainingMs <= 0) {
    return null;
  }

  return (
    <div
      className="border-primary/30 bg-primary/5 rounded-xl border p-5"
      role="timer"
      aria-live="polite"
    >
      <p className="text-muted-foreground text-sm font-medium">Sisa Waktu</p>
      <p className="text-primary mt-1 text-4xl font-semibold tracking-tight tabular-nums">
        {formatCheckoutCountdown(remainingMs)}
      </p>
    </div>
  );
}

export function isCheckoutExpired(expiresAt: string, status: string): boolean {
  if (status === "CANCELLED") {
    return true;
  }

  return new Date(expiresAt).getTime() <= Date.now();
}
