// Prisma CLI configuration (migrate, db pull, studio).
// Runtime queries use DATABASE_URL via @prisma/adapter-pg in src/lib/db/prisma.ts.
import "dotenv/config";
import { defineConfig } from "prisma/config";

function resolvePrismaCliDatabaseUrl(): string {
  const directUrl = process.env["DIRECT_URL"];
  const databaseUrl = process.env["DATABASE_URL"];

  if (directUrl) {
    return directUrl;
  }

  if (databaseUrl) {
    return databaseUrl;
  }

  throw new Error(
    "Missing database URL for Prisma CLI. Set DIRECT_URL (recommended for Supabase) or DATABASE_URL.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need a direct PostgreSQL connection — never the Supabase pooler (6543).
    url: resolvePrismaCliDatabaseUrl(),
  },
});
