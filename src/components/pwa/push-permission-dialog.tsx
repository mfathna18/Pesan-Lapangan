"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { updateBrowserNotificationSettingsAction } from "@/domains/push/push-actions";
import {
  markOnboardingCompleted,
  markPermissionDismissedNow,
  requestBrowserNotificationPermission,
  shouldShowOnboardingPrompt,
} from "@/domains/push/push-permission";
import {
  PUSH_PERMISSION_DISMISS_DAYS,
  PUSH_PERMISSION_PROMPT_DELAY_MS,
  PUSH_PERMISSION_STATE,
} from "@/domains/push/push-types";
import type { OwnerBrowserNotificationSettingsData } from "@/domains/push/push-types";

type PushPermissionDialogProps = {
  settings: OwnerBrowserNotificationSettingsData;
};

export function PushPermissionDialog({ settings }: PushPermissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (shouldShowOnboardingPrompt(PUSH_PERMISSION_DISMISS_DAYS)) {
        setOpen(true);
      }
    }, PUSH_PERMISSION_PROMPT_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [mounted]);

  async function handleEnable() {
    const permission = await requestBrowserNotificationPermission();

    if (permission === PUSH_PERMISSION_STATE.GRANTED) {
      markOnboardingCompleted();
      await updateBrowserNotificationSettingsAction({
        ...settings,
        enabled: true,
      });
    } else if (permission === PUSH_PERMISSION_STATE.DENIED) {
      markOnboardingCompleted();
    }

    setOpen(false);
  }

  function handleLater() {
    markPermissionDismissedNow();
    setOpen(false);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="bg-background w-full max-w-md rounded-[var(--radius-card-lg)] border p-6 shadow-xl"
        role="dialog"
        aria-labelledby="push-permission-title"
        aria-modal="true"
      >
        <div className="space-y-2">
          <h2 id="push-permission-title" className="text-lg font-semibold">
            Aktifkan notifikasi?
          </h2>
          <p className="text-muted-foreground text-sm">
            Agar Anda tidak melewatkan booking baru dan pembayaran.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleLater}>
            Nanti
          </Button>
          <Button type="button" onClick={() => void handleEnable()}>
            Aktifkan
          </Button>
        </div>
      </div>
    </div>
  );
}

export { PushPermissionDialog as NotificationPermissionDialog };
