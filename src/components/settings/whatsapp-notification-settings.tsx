"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { isWhatsAppFeatureEnabled } from "@/config/features";
import { updateWhatsAppSettingsAction } from "@/domains/whatsapp/whatsapp-actions";
import type { OwnerWhatsAppSettingsData } from "@/domains/whatsapp/whatsapp-types";

type WhatsAppNotificationSettingsProps = {
  initialSettings: OwnerWhatsAppSettingsData;
};

type ToggleKey = keyof OwnerWhatsAppSettingsData;

const TOGGLE_ITEMS: Array<{
  key: ToggleKey;
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
    description: "Konfirmasi pembayaran menunggu review owner.",
  },
  {
    key: "notifyReminder",
    label: "Reminder",
    description: "Pengingat bermain ke pelanggan (1 jam sebelum main).",
  },
  {
    key: "notifySubscription",
    label: "Langganan",
    description: "Notifikasi aktivasi langganan venue.",
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

export function WhatsAppNotificationSettings({
  initialSettings,
}: WhatsAppNotificationSettingsProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isWhatsAppFeatureEnabled()) {
    return null;
  }

  function updateSetting(key: ToggleKey, value: boolean) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await updateWhatsAppSettingsAction(settings);

      if (!response.success) {
        setError(response.error);
        return;
      }

      setSettings(response.data);
      setSuccess("Pengaturan WhatsApp berhasil disimpan.");
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            id="whatsapp-enabled"
            label="Aktifkan WhatsApp"
            description="Kirim notifikasi otomatis ke nomor GOR dan pelanggan."
            checked={settings.enabled}
            onChange={(checked) => updateSetting("enabled", checked)}
          />

          <div className="space-y-3">
            {TOGGLE_ITEMS.map((item) => (
              <ToggleRow
                key={item.key}
                id={`whatsapp-${item.key}`}
                label={item.label}
                description={item.description}
                checked={settings[item.key]}
                disabled={!settings.enabled}
                onChange={(checked) => updateSetting(item.key, checked)}
              />
            ))}
          </div>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          {success ? (
            <p className="text-sm text-emerald-600">{success}</p>
          ) : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Pengaturan WhatsApp"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
