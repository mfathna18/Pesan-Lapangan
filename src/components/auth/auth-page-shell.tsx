import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";

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
      <header className="border-border/60 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-col px-4 py-10 sm:px-6 sm:py-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </main>
    </div>
  );
}
