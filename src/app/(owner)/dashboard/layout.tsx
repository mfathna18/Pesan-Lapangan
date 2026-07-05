import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SubscriptionGraceBanner } from "@/components/subscription/subscription-grace-banner";
import { getNotificationService } from "@/domains/notification/actions/get-notification-service";
import { getOwnerSubscriptionAccessForUser } from "@/domains/subscription/guards/subscription-guard";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireOwnerSession();
  const ownerId = await requireOwnerId(session.user.id);
  const [{ access }, notifications] = await Promise.all([
    getOwnerSubscriptionAccessForUser(session.user.id),
    getNotificationService().listRecentForOwner(ownerId),
  ]);

  return (
    <DashboardShell user={session.user} initialNotifications={notifications}>
      {access.showGraceWarning ? (
        <SubscriptionGraceBanner access={access} />
      ) : null}
      {children}
    </DashboardShell>
  );
}
