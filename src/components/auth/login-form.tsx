"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AuthRedirectIfLoggedIn } from "@/components/auth/auth-redirect-if-logged-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveLoginRedirectAction } from "@/domains/admin/actions/resolve-login-redirect.action";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Login gagal.");
        return;
      }

      const redirectPath = await resolveLoginRedirectAction();
      router.push(redirectPath);
      router.refresh();
    });
  };

  return (
    <AuthRedirectIfLoggedIn>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
          >
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Kata Sandi</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isPending}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Masuk..." : "Masuk"}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Daftar
          </Link>
        </p>
      </form>
    </AuthRedirectIfLoggedIn>
  );
}
