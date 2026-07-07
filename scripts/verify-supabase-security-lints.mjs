#!/usr/bin/env node
/**
 * Verifies Supabase Splinter security lints related to Sprint 25 hardening.
 * Run: node scripts/verify-supabase-security-lints.mjs
 */
import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const connectionString =
  process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.error("Missing DIRECT_URL or DATABASE_URL");
  process.exit(1);
}

const APP_TABLES = [
  "user",
  "session",
  "account",
  "verification",
  "owner",
  "subscription",
  "subscription_payment",
  "gor",
  "court",
  "price_rule",
  "operating_hours",
  "booking",
  "booking_contact",
  "payment",
  "payment_confirmation_audit_log",
  "invoice",
  "owner_notification",
  "owner_whatsapp_settings",
  "whatsapp_message_log",
  "owner_browser_notification_settings",
];

const client = new Client({ connectionString });

try {
  await client.connect();

  const role = await client.query(`
    SELECT rolname, rolsuper, rolbypassrls
    FROM pg_roles
    WHERE rolname = current_user
  `);
  console.log("Connection role:", role.rows[0]);

  const rlsStatus = await client.query(
    `
    SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname = ANY($1::text[])
    ORDER BY c.relname
    `,
    [APP_TABLES],
  );

  const missingRls = rlsStatus.rows.filter((row) => !row.rls_enabled);
  console.log(
    `\nRLS enabled: ${rlsStatus.rows.length - missingRls.length}/${rlsStatus.rows.length}`,
  );
  if (missingRls.length > 0) {
    console.error(
      "Tables without RLS:",
      missingRls.map((r) => r.table_name),
    );
  }

  const grants = await client.query(
    `
    SELECT
      c.relname AS table_name,
      has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
      has_table_privilege('authenticated', c.oid, 'SELECT') AS auth_select
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname = ANY($1::text[])
    ORDER BY c.relname
    `,
    [APP_TABLES],
  );

  const exposedGrants = grants.rows.filter(
    (row) => row.anon_select || row.auth_select,
  );
  console.log(
    `\nAnon/authenticated SELECT grants remaining: ${exposedGrants.length}`,
  );
  if (exposedGrants.length > 0) {
    console.error(exposedGrants);
  }

  const rlsDisabledLint = await client.query(
    `
    SELECT c.relname AS table_name
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE c.relkind = 'r'
      AND NOT c.relrowsecurity
      AND (
        pg_catalog.has_table_privilege('anon', c.oid, 'SELECT')
        OR pg_catalog.has_table_privilege('authenticated', c.oid, 'SELECT')
      )
      AND n.nspname = 'public'
      AND c.relname = ANY($1::text[])
    ORDER BY c.relname
  `,
    [APP_TABLES],
  );

  const sensitiveLint = await client.query(
    `
    WITH sensitive_patterns AS (
      SELECT unnest(ARRAY[
        'password', 'token'
      ]) AS pattern
    ),
    exposed_tables AS (
      SELECT n.nspname AS schema_name, c.relname AS table_name, c.oid AS table_oid
      FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
      WHERE c.relkind = 'r'
        AND (
          pg_catalog.has_table_privilege('anon', c.oid, 'SELECT')
          OR pg_catalog.has_table_privilege('authenticated', c.oid, 'SELECT')
        )
        AND n.nspname = 'public'
        AND NOT c.relrowsecurity
        AND c.relname = ANY($1::text[])
    )
    SELECT DISTINCT et.table_name, a.attname AS column_name
    FROM exposed_tables et
    JOIN pg_catalog.pg_attribute a ON a.attrelid = et.table_oid
      AND a.attnum > 0 AND NOT a.attisdropped
    CROSS JOIN sensitive_patterns sp
    WHERE replace(lower(a.attname), '-', '_') = sp.pattern
    ORDER BY et.table_name, a.attname
  `,
    [APP_TABLES],
  );

  console.log("\n=== Splinter-equivalent lint results ===");
  console.log(
    `rls_disabled_in_public (app tables): ${rlsDisabledLint.rows.length} issue(s)`,
  );
  if (rlsDisabledLint.rows.length > 0) {
    console.error(rlsDisabledLint.rows);
  }

  console.log(
    `sensitive_columns_exposed (app tables): ${sensitiveLint.rows.length} issue(s)`,
  );
  if (sensitiveLint.rows.length > 0) {
    console.error(sensitiveLint.rows);
  }

  const prismaProbe = await client.query(
    `SELECT COUNT(*)::int AS users FROM "user"`,
  );
  console.log(`\nPrisma-path probe (user count): ${prismaProbe.rows[0].users}`);

  const failed =
    missingRls.length > 0 ||
    exposedGrants.length > 0 ||
    rlsDisabledLint.rows.length > 0 ||
    sensitiveLint.rows.length > 0;

  if (failed) {
    console.error("\n❌ Security verification FAILED");
    process.exit(1);
  }

  console.log("\n✅ Security verification PASSED");
} finally {
  await client.end();
}
