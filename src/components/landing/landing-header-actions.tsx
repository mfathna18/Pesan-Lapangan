"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function LandingHeaderActions() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  async function handleLogout() {
    await authClient.signOut();
    router.refresh();
  }

  if (isPending) {
    return <span className="text-muted-foreground text-sm">Memuat...</span>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "default", size: "sm" }))}
        >
          Dasbor
        </Link>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Keluar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Masuk
      </Link>
      <Link
        href="/register"
        className={cn(buttonVariants({ variant: "default", size: "sm" }))}
      >
        Daftarkan GOR
      </Link>
    </div>
  );
}
