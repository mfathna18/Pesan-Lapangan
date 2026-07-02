import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { typography } from "@/lib/design-system";

type AuthPageShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthPageShell({
  title,
  description,
  children,
}: AuthPageShellProps) {
  return (
    <div className="bg-background min-h-screen">
      <header className="border-border bg-background/95 border-b backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]"
              aria-hidden
            />
            <span className="text-base font-bold tracking-tight">
              <span className="text-primary">Pesan</span>Lapangan
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-col px-4 py-12 sm:px-6 sm:py-20">
        <Card className="w-full">
          <CardHeader className="gap-2">
            <CardTitle className={typography.h3}>{title}</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </main>
    </div>
  );
}
