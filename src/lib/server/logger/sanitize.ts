import type { LogContext, SerializedError } from "@/lib/server/logger/types";

const SENSITIVE_KEY_PATTERN =
  /(password|secret|token|authorization|api[_-]?key|database_url|connectionstring|server_key|client_key)/i;

const REDACTED_VALUE = "[REDACTED]";

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    if (value.startsWith("postgresql://") || value.startsWith("postgres://")) {
      return REDACTED_VALUE;
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (typeof value === "object") {
    return sanitizeContext(value as LogContext);
  }

  return value;
}

export function sanitizeContext(context: LogContext = {}): LogContext {
  const sanitized: LogContext = {};

  for (const [key, value] of Object.entries(context)) {
    sanitized[key] = isSensitiveKey(key)
      ? REDACTED_VALUE
      : sanitizeValue(value);
  }

  return sanitized;
}

export function serializeError(
  error: unknown,
  options: { includeStack?: boolean } = {},
): SerializedError {
  const includeStack =
    options.includeStack ?? process.env.NODE_ENV !== "production";

  if (error instanceof Error) {
    const prismaCode =
      "code" in error && typeof error.code === "string"
        ? error.code
        : undefined;

    return {
      name: error.name,
      message: error.message,
      ...(prismaCode ? { code: prismaCode } : {}),
      ...(includeStack && error.stack ? { stack: error.stack } : {}),
    };
  }

  return {
    message: typeof error === "string" ? error : "Unknown error",
  };
}

export function toClientErrorMessage(error: unknown, fallback: string): string {
  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
