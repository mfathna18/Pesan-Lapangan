type LogContext = Record<string, unknown>;

export function logServerError(
  message: string,
  error: unknown,
  context?: LogContext,
): void {
  const payload = {
    message,
    ...(context ?? {}),
    error:
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error,
  };

  console.error(JSON.stringify(payload));
}
