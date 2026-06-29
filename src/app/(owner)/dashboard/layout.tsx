import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SubscriptionGraceBanner } from "@/components/subscription/subscription-grace-banner";
import { getOwnerSubscriptionAccessForUser } from "@/domains/subscription/guards/subscription-guard";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireOwnerSession();
  const { access } = await getOwnerSubscriptionAccessForUser(session.user.id);

  return (
    <DashboardShell user={session.user}>
      {access.showGraceWarning ? (
        <SubscriptionGraceBanner access={access} />
      ) : null}
      {children}
    </DashboardShell>
  );
}
