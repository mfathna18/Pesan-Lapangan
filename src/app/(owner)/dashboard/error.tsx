"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { getPublicErrorMessage } from "@/lib/server/errors/public-error-message";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <div className="max-w-md space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Terjadi kesalahan
        </h1>
        <p className="text-muted-foreground text-sm" role="alert">
          {getPublicErrorMessage(
            error,
            "Gagal memuat dashboard. Silakan coba lagi.",
          )}
        </p>
      </div>
      <Button type="button" onClick={reset}>
        Coba lagi
      </Button>
    </div>
  );
}
