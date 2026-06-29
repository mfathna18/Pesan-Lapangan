import { env } from "@/config/env";

export const siteConfig = {
  name: "PesanLapangan",
  description:
    "Pesan lapangan olahraga online — badminton, futsal, basket, dan lainnya. Cepat, mudah, dan aman.",
  url: env.NEXT_PUBLIC_APP_URL,
  keywords: [
    "pesan lapangan",
    "booking lapangan",
    "sewa lapangan",
    "lapangan badminton",
    "lapangan futsal",
    "booking olahraga",
  ],
} as const;
