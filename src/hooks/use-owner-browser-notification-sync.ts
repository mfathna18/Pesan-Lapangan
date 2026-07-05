import { useCallback, useEffect, useRef } from "react";

import type { OwnerNotificationItem } from "@/domains/notification/types";
import { createPushEmitter } from "@/domains/push/push-emitter";
import type { OwnerBrowserNotificationSettingsData } from "@/domains/push/push-types";
import { PUSH_NOTIFIED_IDS_KEY } from "@/domains/push/push-types";
import { getBrowserNotificationPermission } from "@/domains/push/push-permission";
import { PUSH_PERMISSION_STATE } from "@/domains/push/push-types";

function readNotifiedIds(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw = window.sessionStorage.getItem(PUSH_NOTIFIED_IDS_KEY);

    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function writeNotifiedIds(ids: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    PUSH_NOTIFIED_IDS_KEY,
    JSON.stringify(Array.from(ids)),
  );
}

export function useOwnerBrowserNotificationSync(
  items: OwnerNotificationItem[],
  settings: OwnerBrowserNotificationSettingsData,
) {
  const notifiedIdsRef = useRef<Set<string>>(readNotifiedIds());
  const initializedRef = useRef(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const processItems = useCallback(
    async (nextItems: OwnerNotificationItem[]) => {
      if (
        getBrowserNotificationPermission() !== PUSH_PERMISSION_STATE.GRANTED ||
        !settingsRef.current.enabled
      ) {
        return;
      }

      const emitter = createPushEmitter();

      if (!emitter.canNotify()) {
        return;
      }

      if (!initializedRef.current) {
        for (const item of nextItems) {
          notifiedIdsRef.current.add(item.id);
        }
        writeNotifiedIds(notifiedIdsRef.current);
        initializedRef.current = true;
        return;
      }

      for (const item of nextItems) {
        if (notifiedIdsRef.current.has(item.id)) {
          continue;
        }

        if (item.readAt) {
          notifiedIdsRef.current.add(item.id);
          continue;
        }

        await emitter.emitOwnerNotification(item, settingsRef.current);
        notifiedIdsRef.current.add(item.id);
      }

      writeNotifiedIds(notifiedIdsRef.current);
    },
    [],
  );

  useEffect(() => {
    void processItems(items);
  }, [items, processItems]);
}
