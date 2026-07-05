import { env } from "@/config/env";

export function isWhatsAppFeatureEnabled(): boolean {
  return env.NEXT_PUBLIC_FEATURE_WHATSAPP;
}
