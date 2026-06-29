export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

export type SerializedError = {
  name?: string;
  message: string;
  stack?: string;
  code?: string;
};
