"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PwaNotificationNavigateListener() {
  const router = useRouter();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    function handleMessage(event: MessageEvent) {
      const data = event.data as { type?: string; url?: string } | null;

      if (data?.type === "PWA_NOTIFICATION_NAVIGATE" && data.url) {
        router.push(data.url);
      }
    }

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [router]);

  return null;
}
