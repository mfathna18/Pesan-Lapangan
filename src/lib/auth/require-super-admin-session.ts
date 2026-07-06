import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { USER_ROLE } from "@/domains/auth/constants";
import { ensureSuperAdminRole } from "@/domains/admin/services/super-admin-provisioning";
import { auth } from "@/lib/auth";

export async function requireSuperAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const role = await ensureSuperAdminRole(session.user.id, session.user.email);

  if (role !== USER_ROLE.SUPER_ADMIN) {
    redirect("/dashboard");
  }

  return session;
}
