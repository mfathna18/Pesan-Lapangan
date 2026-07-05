import { NotificationCenter } from "@/components/notification/notification-center";
import { createPageMetadata } from "@/config/page-metadata";
import { getNotificationService } from "@/domains/notification/actions/get-notification-service";
import { getPushService } from "@/domains/push/actions/get-push-service";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export const metadata = createPageMetadata(
  "Notifikasi",
  "Pusat notifikasi venue — booking, pembayaran, dan langganan.",
);

export default async function NotificationsPage() {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);
  const [initialData, browserNotificationSettings] = await Promise.all([
    getNotificationService().listForOwner({
      ownerId,
      filter: "all",
    }),
    getPushService().getSettingsForOwner(ownerId),
  ]);

  return (
    <NotificationCenter
      initialData={initialData}
      browserNotificationSettings={browserNotificationSettings}
    />
  );
}
