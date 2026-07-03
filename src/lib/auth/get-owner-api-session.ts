import { headers } from "next/headers";

import { OWNER_ROLE } from "@/domains/owner/constants";
import { auth } from "@/lib/auth";

export async function getOwnerApiSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== OWNER_ROLE) {
    return null;
  }

  return session;
}
