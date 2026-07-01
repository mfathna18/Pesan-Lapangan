import type { Metadata } from "next";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { createPageMetadata } from "@/config/page-metadata";

export const metadata: Metadata = {
  ...createPageMetadata(
    "Daftar",
    "Buat akun pemilik untuk mendaftarkan dan mengelola GOR Anda.",
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <AuthPageShell
      title="Daftar"
      description="Buat akun pemilik untuk mendaftarkan dan mengelola GOR Anda."
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
