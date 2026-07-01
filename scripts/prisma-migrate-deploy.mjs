/**
 * Runs `prisma migrate deploy` with a direct PostgreSQL connection.
 *
 * Supabase (and other PgBouncer poolers) cannot run migrations on the pooled URL
 * (port 6543 / ?pgbouncer=true) — the command may hang with no error output.
 */
import { execSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL ?? "";
const directUrl = process.env.DIRECT_URL ?? "";
const usesPooler =
  databaseUrl.includes("pgbouncer=true") ||
  databaseUrl.includes(":6543/") ||
  databaseUrl.includes(":6543?");

if (usesPooler && !directUrl) {
  console.error(
    [
      "",
      "ERROR: DATABASE_URL uses a connection pooler (Supabase pooler / PgBouncer).",
      "Prisma migrate deploy requires a direct connection.",
      "",
      "Set DIRECT_URL in Vercel to your Supabase direct/session connection (port 5432).",
      "Example:",
      '  DATABASE_URL="...pooler.supabase.com:6543/postgres?pgbouncer=true"',
      '  DIRECT_URL="...pooler.supabase.com:5432/postgres"',
      "",
      "See docs/DEPLOYMENT.md → Supabase",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

execSync("npx prisma migrate deploy", { stdio: "inherit" });
