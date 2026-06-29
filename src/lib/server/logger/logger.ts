import { sanitizeContext, serializeError } from "@/lib/server/logger/sanitize";
import type { LogContext, LogLevel } from "@/lib/server/logger/types";

const isProduction = process.env.NODE_ENV === "production";

function writeLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
): void {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
    ...sanitizeContext(context),
  };

  if (isProduction) {
    const line = JSON.stringify(payload);

    switch (level) {
      case "error":
        console.error(line);
        break;
      case "warn":
        console.warn(line);
        break;
      default:
        console.log(line);
        break;
    }

    return;
  }

  const prefix = `[${level.toUpperCase()}]`;

  switch (level) {
    case "error":
      console.error(prefix, message, context ?? "");
      break;
    case "warn":
      console.warn(prefix, message, context ?? "");
      break;
    case "debug":
      console.debug(prefix, message, context ?? "");
      break;
    default:
      console.info(prefix, message, context ?? "");
      break;
  }
}

export function logDebug(message: string, context?: LogContext): void {
  if (isProduction) {
    return;
  }

  writeLog("debug", message, context);
}

export function logInfo(message: string, context?: LogContext): void {
  writeLog("info", message, context);
}

export function logWarn(message: string, context?: LogContext): void {
  writeLog("warn", message, context);
}

export function logError(
  message: string,
  error?: unknown,
  context?: LogContext,
): void {
  writeLog("error", message, {
    ...context,
    ...(error !== undefined ? { error: serializeError(error) } : {}),
  });
}

export function logUnexpectedError(
  scope: string,
  error: unknown,
  context?: LogContext,
): void {
  logError(`Unexpected error in ${scope}`, error, {
    scope,
    ...context,
  });
}

/** @deprecated Use logError or logUnexpectedError instead. */
export function logServerError(
  message: string,
  error: unknown,
  context?: LogContext,
): void {
  logError(message, error, context);
}
