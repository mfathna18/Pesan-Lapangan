import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireOwnerSession();

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
