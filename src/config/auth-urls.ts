import { env } from "@/config/env";

const LOCAL_DEV_ORIGIN_PATTERNS = [
  "http://localhost:*",
  "http://127.0.0.1:*",
  "http://[::1]:*",
] as const;

function getVercelDeploymentOrigin(): string | null {
  const vercelUrl = process.env.VERCEL_URL;

  if (!vercelUrl) {
    return null;
  }

  return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
}

export function getAuthTrustedOrigins(): string[] {
  const origins = new Set<string>([
    env.BETTER_AUTH_URL,
    env.NEXT_PUBLIC_APP_URL,
  ]);

  const vercelOrigin = getVercelDeploymentOrigin();

  if (vercelOrigin) {
    origins.add(vercelOrigin);
  }

  if (env.NODE_ENV === "development") {
    for (const pattern of LOCAL_DEV_ORIGIN_PATTERNS) {
      origins.add(pattern);
    }
  }

  return [...origins];
}

export function getAuthClientBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return env.NEXT_PUBLIC_APP_URL;
}
