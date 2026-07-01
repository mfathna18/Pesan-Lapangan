"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UI_COPY } from "@/config/ui-copy";
import { OPERATING_HOURS_WEEKDAYS } from "@/domains/availability/constants";
import type { OwnerPriceRuleListItem } from "@/domains/booking/types";
import { cn } from "@/lib/utils";

export type PriceRuleFormValues = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  price: string;
  isActive: boolean;
};

type PriceRuleFormPanelProps = {
  open: boolean;
  mode: "create" | "edit";
  rule: OwnerPriceRuleListItem | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: PriceRuleFormValues) => void;
};

function createFormValues(
  rule: OwnerPriceRuleListItem | null,
): PriceRuleFormValues {
  return {
    dayOfWeek: rule?.dayOfWeek ?? 1,
    startTime: rule?.startTime ?? "08:00",
    endTime: rule?.endTime ?? "22:00",
    price: rule ? String(rule.price) : "",
    isActive: rule?.isActive ?? true,
  };
}

export function PriceRuleFormPanel({
  open,
  mode,
  rule,
  loading,
  error,
  onClose,
  onSubmit,
}: PriceRuleFormPanelProps) {
  const [form, setForm] = useState<PriceRuleFormValues>(() =>
    createFormValues(rule),
  );

  useEffect(() => {
    if (open) {
      setForm(createFormValues(rule));
    }
  }, [open, rule]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <>
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "bg-background border-border fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="border-border flex h-16 items-center justify-between border-b px-4">
          <div>
            <p className="text-sm font-semibold">
              {mode === "create" ? "Tambah Aturan Harga" : "Ubah Aturan Harga"}
            </p>
            <p className="text-muted-foreground text-xs">
              {mode === "create"
                ? "Buat jendela harga baru untuk lapangan ini."
                : "Perbarui aturan harga yang dipilih."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Tutup formulir aturan harga"
          >
            <X />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {error ? (
              <p
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
              >
                {error}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="price-rule-day">Hari</Label>
              <Select
                value={String(form.dayOfWeek)}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    dayOfWeek: Number(value),
                  }))
                }
                disabled={loading}
              >
                <SelectTrigger id="price-rule-day" className="w-full">
                  <SelectValue placeholder="Pilih hari">
                    {() =>
                      OPERATING_HOURS_WEEKDAYS.find(
                        (day) => day.dayOfWeek === form.dayOfWeek,
                      )?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {OPERATING_HOURS_WEEKDAYS.map((day) => (
                    <SelectItem
                      key={day.dayOfWeek}
                      value={String(day.dayOfWeek)}
                    >
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price-rule-start">Waktu Mulai</Label>
              <Input
                id="price-rule-start"
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price-rule-end">Waktu Selesai</Label>
              <Input
                id="price-rule-end"
                type="time"
                value={form.endTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    endTime: event.target.value,
                  }))
                }
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price-rule-price">Harga (IDR)</Label>
              <Input
                id="price-rule-price"
                type="number"
                min={1}
                step={1}
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                disabled={loading}
                required
                placeholder="150000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price-rule-status">{UI_COPY.status}</Label>
              <Select
                value={form.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    isActive: value === "active",
                  }))
                }
                disabled={loading}
              >
                <SelectTrigger id="price-rule-status" className="w-full">
                  <SelectValue placeholder="Pilih status">
                    {() => (form.isActive ? UI_COPY.active : UI_COPY.inactive)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{UI_COPY.active}</SelectItem>
                  <SelectItem value="inactive">{UI_COPY.inactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-border flex gap-2 border-t p-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              {UI_COPY.cancel}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? UI_COPY.saving : UI_COPY.save}
            </Button>
          </div>
        </form>
      </aside>
    </>
  );
}
