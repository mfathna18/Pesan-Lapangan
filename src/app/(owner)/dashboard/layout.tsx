import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SubscriptionGraceBanner } from "@/components/subscription/subscription-grace-banner";
import { getNotificationService } from "@/domains/notification/actions/get-notification-service";
import {
  getCachedOwnerId,
  getCachedOwnerSession,
  getCachedPushSettings,
  getCachedSubscriptionAccess,
} from "@/lib/auth/cached-owner-request";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCachedOwnerSession();
  const ownerId = await getCachedOwnerId(session.user.id);
  const [{ access }, notifications, browserNotificationSettings] =
    await Promise.all([
      getCachedSubscriptionAccess(session.user.id),
      getNotificationService().listRecentForOwner(ownerId),
      getCachedPushSettings(ownerId),
    ]);

  return (
    <DashboardShell
      user={session.user}
      initialNotifications={notifications}
      browserNotificationSettings={browserNotificationSettings}
    >
      {access.showGraceWarning ? (
        <SubscriptionGraceBanner access={access} />
      ) : null}
      {children}
    </DashboardShell>
  );
}
