"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BROWSER_NOTIFICATION_DENIED_MESSAGE,
  completeBrowserNotificationActivation,
  isBrowserNotificationActive,
  requestPermissionFromUserClick,
} from "@/domains/push/browser-notification-activation";
import { getBrowserNotificationPermission } from "@/domains/push/push-permission";
import type { OwnerBrowserNotificationSettingsData } from "@/domains/push/push-types";
import {
  PUSH_ACTIVATION_CARD_DISMISS_KEY,
  PUSH_PERMISSION_STATE,
  type PushPermissionState,
} from "@/domains/push/push-types";

type BrowserNotificationActivationCardProps = {
  initialSettings: OwnerBrowserNotificationSettingsData;
};

export function BrowserNotificationActivationCard({
  initialSettings,
}: BrowserNotificationActivationCardProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [permission, setPermission] = useState<PushPermissionState>(
    PUSH_PERMISSION_STATE.DEFAULT,
  );
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPermission(getBrowserNotificationPermission());
    setDismissed(
      window.localStorage.getItem(PUSH_ACTIVATION_CARD_DISMISS_KEY) === "true",
    );
  }, []);

  function handleDismiss() {
    window.localStorage.setItem(PUSH_ACTIVATION_CARD_DISMISS_KEY, "true");
    setDismissed(true);
  }

  function handleActivateClick() {
    if (permission === PUSH_PERMISSION_STATE.DENIED) {
      return;
    }

    setIsActivating(true);

    const permissionPromise = requestPermissionFromUserClick();

    void permissionPromise.then(async (nextPermission) => {
      setPermission(nextPermission);

      if (nextPermission === PUSH_PERMISSION_STATE.GRANTED) {
        const result = await completeBrowserNotificationActivation(
          nextPermission,
          settings,
        );

        if (result.settings) {
          setSettings(result.settings);
        }
      }

      setIsActivating(false);
    });
  }

  if (!mounted || dismissed || isBrowserNotificationActive(permission)) {
    return null;
  }

  if (permission === PUSH_PERMISSION_STATE.UNSUPPORTED) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5 relative">
      <button
        type="button"
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground absolute top-3 right-3 rounded-md p-1"
        aria-label="Tutup"
      >
        <X className="size-4" />
      </button>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2 pr-8">
          <h2 className="text-base font-semibold">
            🔔 Jangan Lewatkan Booking Baru
          </h2>
          <p className="text-muted-foreground text-sm">
            Aktifkan notifikasi browser agar Anda langsung mengetahui booking
            baru, pembayaran yang perlu dikonfirmasi, dan informasi penting
            lainnya.
          </p>
        </div>

        {permission === PUSH_PERMISSION_STATE.DENIED ? (
          <p className="text-muted-foreground text-sm">
            {BROWSER_NOTIFICATION_DENIED_MESSAGE}
          </p>
        ) : (
          <Button
            type="button"
            onClick={handleActivateClick}
            disabled={isActivating}
          >
            {isActivating ? "Memproses..." : "Aktifkan Notifikasi"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
