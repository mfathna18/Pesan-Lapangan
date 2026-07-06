"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { resolveLoginRedirectAction } from "@/domains/admin/actions/resolve-login-redirect.action";
import { authClient } from "@/lib/auth-client";

type AuthRedirectIfLoggedInProps = {
  children: React.ReactNode;
};

export function AuthRedirectIfLoggedIn({
  children,
}: AuthRedirectIfLoggedInProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      void resolveLoginRedirectAction().then((path) => {
        router.replace(path);
      });
    }
  }, [isPending, router, session]);

  if (isPending || session) {
    return (
      <p className="text-muted-foreground text-center text-sm">Memuat...</p>
    );
  }

  return children;
}
