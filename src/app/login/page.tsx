import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { createPageMetadata } from "@/config/page-metadata";

export const metadata: Metadata = {
  ...createPageMetadata(
    "Masuk",
    "Masuk untuk mengelola venue dan booking Anda.",
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Masuk"
      description="Masuk untuk mengelola venue dan booking Anda."
    >
      <LoginForm />
    </AuthPageShell>
  );
}
