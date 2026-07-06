"use server";

import { headers } from "next/headers";

import { USER_ROLE } from "@/domains/auth/constants";
import { ensureSuperAdminRole } from "@/domains/admin/services/super-admin-provisioning";
import { auth } from "@/lib/auth";

export async function resolveLoginRedirectAction(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return "/login";
  }

  const role = await ensureSuperAdminRole(session.user.id, session.user.email);

  return role === USER_ROLE.SUPER_ADMIN ? "/admin" : "/dashboard";
}
