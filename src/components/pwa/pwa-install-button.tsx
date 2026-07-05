"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { isStandalonePwaDisplayMode } from "@/domains/push/push-permission";
import { PWA_INSTALLED_KEY } from "@/domains/push/push-types";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallButton() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalonePwaDisplayMode()) {
      setInstalled(true);
      return;
    }

    if (window.localStorage.getItem(PWA_INSTALLED_KEY) === "true") {
      setInstalled(true);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setInstallEvent(null);
      window.localStorage.setItem(PWA_INSTALLED_KEY, "true");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setInstalled(true);
      setInstallEvent(null);
      window.localStorage.setItem(PWA_INSTALLED_KEY, "true");
    }
  }

  if (installed || !installEvent) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="hidden sm:inline-flex"
      onClick={() => void handleInstall()}
    >
      <Download className="size-4" aria-hidden />
      Install PesanLapangan
    </Button>
  );
}
