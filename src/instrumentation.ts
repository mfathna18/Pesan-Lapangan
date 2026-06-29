export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/config/env");
    await import("@/lib/server/monitoring");
  }
}
