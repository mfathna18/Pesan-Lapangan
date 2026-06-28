import { env } from "@/config/env";

export const siteConfig = {
  name: "PesanLapangan",
  description: "SaaS platform for sports field booking management.",
  url: env.NEXT_PUBLIC_APP_URL,
} as const;
