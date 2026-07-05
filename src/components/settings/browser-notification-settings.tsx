"use client";

import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { updateBrowserNotificationSettingsAction } from "@/domains/push/push-actions";
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
} from "@/domains/push/push-permission";
import type { OwnerBrowserNotificationSettingsData } from "@/domains/push/push-types";
import {
  PUSH_PERMISSION_STATE,
  type PushPermissionState,
} from "@/domains/push/push-types";

type BrowserNotificationSettingsProps = {
  initialSettings: OwnerBrowserNotificationSettingsData;
};

type ToggleKey = keyof OwnerBrowserNotificationSettingsData;

const TOGGLE_ITEMS: Array<{
  key: Exclude<ToggleKey, "enabled">;
  label: string;
  description: string;
}> = [
  {
    key: "notifyBooking",
    label: "Booking",
    description: "Booking baru dan pembatalan slot.",
  },
  {
    key: "notifyPayment",
    label: "Pembayaran",
    description: "Pembayaran menunggu konfirmasi dan ditolak.",
  },
  {
    key: "notifyReminder",
    label: "Reminder",
    description: "Pengingat langganan venue akan berakhir.",
  },
  {
    key: "notifySubscription",
    label: "Langganan",
    description: "Notifikasi langganan venue akan habis.",
  },
];

function ToggleRow({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="border-border/60 flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <input
        id={id}
        type="checkbox"
        className="accent-primary mt-1 size-4"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </div>
  );
}

export function BrowserNotificationSettings({
  initialSettings,
}: BrowserNotificationSettingsProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [permission, setPermission] = useState<PushPermissionState>(
    PUSH_PERMISSION_STATE.DEFAULT,
  );

  useEffect(() => {
    setPermission(getBrowserNotificationPermission());
  }, []);

  const permissionBlocked = permission === PUSH_PERMISSION_STATE.DENIED;

  function updateSetting(key: ToggleKey, value: boolean) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleEnablePermission() {
    const nextPermission = await requestBrowserNotificationPermission();
    setPermission(nextPermission);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await updateBrowserNotificationSettingsAction(settings);

      if (!response.success) {
        setError(response.error);
        return;
      }

      setSettings(response.data);
      setSuccess("Pengaturan notifikasi browser berhasil disimpan.");
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Browser Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissionBlocked ? (
            <p className="text-muted-foreground text-sm">
              Notifikasi browser diblokir di perangkat ini. Aktifkan melalui
              pengaturan browser, lalu muat ulang halaman. Notification Center
              tetap tersedia sebagai fallback.
            </p>
          ) : permission !== PUSH_PERMISSION_STATE.GRANTED ? (
            <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                Izin notifikasi browser belum aktif.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleEnablePermission()}
              >
                Aktifkan Notifikasi
              </Button>
            </div>
          ) : null}

          <ToggleRow
            id="browser-notification-enabled"
            label="Aktifkan Browser Notification"
            description="Tampilkan notifikasi langsung di browser saat ada event baru."
            checked={settings.enabled}
            onChange={(checked) => updateSetting("enabled", checked)}
          />

          <div className="space-y-3">
            {TOGGLE_ITEMS.map((item) => (
              <ToggleRow
                key={item.key}
                id={`browser-${item.key}`}
                label={item.label}
                description={item.description}
                checked={settings[item.key]}
                disabled={!settings.enabled || permissionBlocked}
                onChange={(checked) => updateSetting(item.key, checked)}
              />
            ))}
          </div>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          {success ? (
            <p className="text-sm text-emerald-600">{success}</p>
          ) : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Pengaturan Browser"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
