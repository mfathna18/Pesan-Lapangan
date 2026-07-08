"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { CourtGallerySettings } from "@/components/court/court-gallery-settings";
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
import { COURT_SPORT_TYPE_VALUES } from "@/domains/booking/constants";
import type { OwnerCourtListItem } from "@/domains/booking/types";
import { VENUE_SPORT_TYPE_LABELS } from "@/domains/venue/constants";
import { UI_COPY } from "@/config/ui-copy";
import { cn } from "@/lib/utils";

export type CourtFormValues = {
  name: string;
  sportType: string;
  isActive: boolean;
};

type CourtFormPanelProps = {
  open: boolean;
  mode: "create" | "edit";
  court: OwnerCourtListItem | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: CourtFormValues) => void;
  onCourtImagesChange?: (courtId: string, imageUrls: string[]) => void;
};

function createFormValues(court: OwnerCourtListItem | null): CourtFormValues {
  return {
    name: court?.name ?? "",
    sportType: court?.sportType ?? "BADMINTON",
    isActive: court?.isActive ?? true,
  };
}

export function CourtFormPanel({
  open,
  mode,
  court,
  loading,
  error,
  onClose,
  onSubmit,
  onCourtImagesChange,
}: CourtFormPanelProps) {
  const [form, setForm] = useState<CourtFormValues>(() =>
    createFormValues(court),
  );

  useEffect(() => {
    if (open) {
      setForm(createFormValues(court));
    }
  }, [open, court]);

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
              {mode === "create" ? "Tambah Lapangan" : "Ubah Lapangan"}
            </p>
            <p className="text-muted-foreground text-xs">
              {mode === "create"
                ? "Buat lapangan baru untuk venue Anda."
                : (court?.name ?? "Perbarui detail lapangan")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Tutup formulir lapangan"
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
              <Label htmlFor="court-name">Nama Lapangan</Label>
              <Input
                id="court-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="court-sport-type">Jenis Olahraga</Label>
              <Select
                value={form.sportType}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    sportType: value ?? "BADMINTON",
                  }))
                }
                disabled={loading}
              >
                <SelectTrigger id="court-sport-type" className="w-full">
                  <SelectValue placeholder="Pilih jenis olahraga" />
                </SelectTrigger>
                <SelectContent>
                  {COURT_SPORT_TYPE_VALUES.map((sportType) => (
                    <SelectItem key={sportType} value={sportType}>
                      {VENUE_SPORT_TYPE_LABELS[sportType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="court-status">{UI_COPY.status}</Label>
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
                <SelectTrigger id="court-status" className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{UI_COPY.active}</SelectItem>
                  <SelectItem value="inactive">{UI_COPY.inactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "edit" && court ? (
              <div className="border-border space-y-3 border-t pt-4">
                <CourtGallerySettings
                  courtId={court.id}
                  initialImages={court.imageUrls}
                  disabled={loading}
                  onImagesChange={(imageUrls) =>
                    onCourtImagesChange?.(court.id, imageUrls)
                  }
                />
              </div>
            ) : mode === "create" ? (
              <p className="text-muted-foreground text-sm">
                Setelah lapangan dibuat, Anda dapat menambahkan hingga 5 foto
                galeri di menu ubah lapangan.
              </p>
            ) : null}
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
