"use client";

import { ChevronDown, Download, FileSpreadsheet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { focusRing, transition } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type ExportDropdownProps = {
  label?: string;
  endpoint: string;
  params?: Record<string, string | undefined>;
  disabled?: boolean;
};

function buildExportUrl(
  endpoint: string,
  format: "csv" | "xlsx",
  params: Record<string, string | undefined>,
): string {
  const url = new URL(endpoint, window.location.origin);
  url.searchParams.set("format", format);

  for (const [key, value] of Object.entries(params)) {
    if (value && value.trim() !== "" && value !== "all") {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

export function ExportDropdown({
  label = "Export",
  endpoint,
  params = {},
  disabled = false,
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleExport(format: "csv" | "xlsx") {
    setOpen(false);
    window.location.href = buildExportUrl(endpoint, format, params);
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="gap-2"
      >
        <Download className="size-4" aria-hidden />
        {label}
        <ChevronDown
          className={cn("size-4 opacity-70", open && "rotate-180", transition)}
          aria-hidden
        />
      </Button>

      {open ? (
        <div
          role="menu"
          className="border-border bg-popover absolute top-[calc(100%+0.5rem)] right-0 z-50 w-48 rounded-[var(--radius-card)] border p-1.5 shadow-[var(--shadow-lg)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport("csv")}
            className={cn(
              "hover:bg-muted flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium",
              focusRing,
              transition,
            )}
          >
            <Download className="size-4" aria-hidden />
            Export CSV
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport("xlsx")}
            className={cn(
              "hover:bg-muted flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium",
              focusRing,
              transition,
            )}
          >
            <FileSpreadsheet className="size-4" aria-hidden />
            Export Excel
          </button>
        </div>
      ) : null}
    </div>
  );
}
