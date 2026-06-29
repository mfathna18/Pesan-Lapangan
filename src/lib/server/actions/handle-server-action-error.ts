import {
  actionFailure,
  type ActionFailure,
} from "@/lib/server/actions/action-response";
import { logUnexpectedError } from "@/lib/server/logger";
import { captureException } from "@/lib/server/monitoring";
import type { LogContext } from "@/lib/server/logger/types";

export type KnownActionErrorHandler = {
  predicate: (error: unknown) => boolean;
  message: string | ((error: unknown) => string);
};

export function createKnownActionError<T extends Error>(
  ErrorClass: new (...args: never[]) => T,
  message?: string | ((error: T) => string),
): KnownActionErrorHandler {
  return {
    predicate: (error): error is T => error instanceof ErrorClass,
    message:
      typeof message === "function"
        ? (error) => message(error as T)
        : (message ?? ((error) => (error as T).message)),
  };
}

export function handleServerActionError(
  scope: string,
  error: unknown,
  options: {
    fallbackMessage: string;
    knownErrors?: KnownActionErrorHandler[];
    context?: LogContext;
  },
): ActionFailure {
  for (const knownError of options.knownErrors ?? []) {
    if (knownError.predicate(error)) {
      const resolvedMessage =
        typeof knownError.message === "function"
          ? knownError.message(error)
          : knownError.message;

      return actionFailure(resolvedMessage);
    }
  }

  logUnexpectedError(scope, error, options.context);
  captureException(error, { scope, ...options.context });

  return actionFailure(options.fallbackMessage);
}
