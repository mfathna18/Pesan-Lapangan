export type MonitoringLevel = "info" | "warning" | "error";

export type MonitoringContext = Record<string, unknown>;

export interface MonitoringProvider {
  captureException(error: unknown, context?: MonitoringContext): void;
  captureMessage(
    message: string,
    level?: MonitoringLevel,
    context?: MonitoringContext,
  ): void;
}

class NoopMonitoringProvider implements MonitoringProvider {
  captureException(): void {}

  captureMessage(): void {}
}

let monitoringProvider: MonitoringProvider = new NoopMonitoringProvider();

export function setMonitoringProvider(provider: MonitoringProvider): void {
  monitoringProvider = provider;
}

export function getMonitoringProvider(): MonitoringProvider {
  return monitoringProvider;
}

export function captureException(
  error: unknown,
  context?: MonitoringContext,
): void {
  monitoringProvider.captureException(error, context);
}

export function captureMessage(
  message: string,
  level: MonitoringLevel = "info",
  context?: MonitoringContext,
): void {
  monitoringProvider.captureMessage(message, level, context);
}

/**
 * Placeholder for a future Sentry/OpenTelemetry adapter.
 * Call setMonitoringProvider() during app bootstrap when ready.
 */
export function createNoopMonitoringProvider(): MonitoringProvider {
  return new NoopMonitoringProvider();
}
