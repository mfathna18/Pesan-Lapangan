"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CourtUpgradeDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function CourtUpgradeDialog({ open, onClose }: CourtUpgradeDialogProps) {
  return (
    <>
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="court-upgrade-title"
        className={cn(
          "bg-background border-border fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-xl transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <h2 id="court-upgrade-title" className="text-lg font-semibold">
          Batas Lapangan Tercapai
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Paket langganan Anda telah mencapai batas jumlah lapangan. Upgrade
          paket untuk menambahkan lapangan baru.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Link
            href="/dashboard/subscription"
            className={cn(buttonVariants())}
            onClick={onClose}
          >
            Upgrade Paket
          </Link>
        </div>
      </div>
    </>
  );
}
