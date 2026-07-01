export function getPublicErrorMessage(
  error: Error,
  fallback = "Terjadi kesalahan. Silakan coba lagi.",
): string {
  if (process.env.NODE_ENV === "development") {
    return error.message || fallback;
  }

  return fallback;
}
