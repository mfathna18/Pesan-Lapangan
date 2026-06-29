"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { getPublicErrorMessage } from "@/lib/server/errors/public-error-message";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Terjadi Kesalahan
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base" role="alert">
          {getPublicErrorMessage(
            error,
            "Something went wrong. Please try again.",
          )}
        </p>
      </div>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
