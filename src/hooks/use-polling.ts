"use client";

import { useEffect, useRef } from "react";

export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const tick = () => {
      void savedCallback.current();
    };

    const intervalId = window.setInterval(tick, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs]);
}
