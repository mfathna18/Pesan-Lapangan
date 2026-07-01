"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AuthRedirectIfLoggedIn } from "@/components/auth/auth-redirect-if-logged-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok.");
      return;
    }

    startTransition(async () => {
      const result = await authClient.signUp.email({
        name: fullName.trim(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Pendaftaran gagal.");
        return;
      }

      router.push("/dashboard");
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
          <Label htmlFor="fullName">Nama Lengkap</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            disabled={isPending}
            required
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isPending}
            minLength={8}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isPending}
            minLength={8}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Membuat akun..." : "Daftar"}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </form>
    </AuthRedirectIfLoggedIn>
  );
}
