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

function addOriginWithWwwVariant(origins: Set<string>, url: string): void {
  const normalized = url.replace(/\/+$/, "");
  origins.add(normalized);

  try {
    const parsed = new URL(normalized);
    const { hostname, protocol, port } = parsed;

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".vercel.app")
    ) {
      return;
    }

    const portSuffix = port ? `:${port}` : "";

    if (hostname.startsWith("www.")) {
      origins.add(`${protocol}//${hostname.slice(4)}${portSuffix}`);
      return;
    }

    origins.add(`${protocol}//www.${hostname}${portSuffix}`);
  } catch {
    // Ignore malformed URLs; env validation should catch these at startup.
  }
}

export function getAuthTrustedOrigins(): string[] {
  const origins = new Set<string>();

  addOriginWithWwwVariant(origins, env.BETTER_AUTH_URL);
  addOriginWithWwwVariant(origins, env.NEXT_PUBLIC_APP_URL);

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
