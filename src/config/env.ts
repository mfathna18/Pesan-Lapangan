import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

function publicAppUrl(label: string) {
  return z
    .string()
    .url()
    .superRefine((value, context) => {
      const isLocalDevelopmentUrl =
        value.startsWith("http://localhost") ||
        value.startsWith("http://127.0.0.1");

      if (isLocalDevelopmentUrl) {
        return;
      }

      if (!value.startsWith("https://")) {
        context.addIssue({
          code: "custom",
          message: `${label} must use HTTPS for non-local deployments.`,
        });
      }
    });
}

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: publicAppUrl("BETTER_AUTH_URL"),
    MIDTRANS_SERVER_KEY: z.string().min(1),
    MIDTRANS_CLIENT_KEY: z.string().min(1),
    MIDTRANS_IS_PRODUCTION: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    CRON_SECRET: z.string().min(16),
    WHATSAPP_ENABLED: z
      .enum(["true", "false"])
      .default("true")
      .transform((value) => value === "true"),
    WHATSAPP_PROVIDER: z
      .enum(["fonnte", "wablas", "wa-gateway", "meta", "noop"])
      .default("noop"),
    WHATSAPP_API_TOKEN: z.string().min(1).optional(),
    WHATSAPP_API_URL: z.string().url().optional(),
    WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: publicAppUrl("NEXT_PUBLIC_APP_URL"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
    MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY,
    MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION,
    CRON_SECRET: process.env.CRON_SECRET,
    WHATSAPP_ENABLED: process.env.WHATSAPP_ENABLED,
    WHATSAPP_PROVIDER: process.env.WHATSAPP_PROVIDER,
    WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN,
    WHATSAPP_API_URL: process.env.WHATSAPP_API_URL,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
