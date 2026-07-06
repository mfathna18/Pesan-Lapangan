import { AdminShell } from "@/components/admin/admin-shell";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin-session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSuperAdminSession();

  return <AdminShell user={session.user}>{children}</AdminShell>;
}
