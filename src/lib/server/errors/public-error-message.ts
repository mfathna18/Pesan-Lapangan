export function getPublicErrorMessage(
  error: Error,
  fallback = "Something went wrong. Please try again.",
): string {
  if (process.env.NODE_ENV === "development") {
    return error.message || fallback;
  }

  return fallback;
}
