#!/usr/bin/env node

/**
 * Creates public Supabase Storage buckets for PesanLapangan media uploads.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/setup-supabase-storage.mjs
 */

import { createClient } from "@supabase/supabase-js";

const BUCKETS = [
  {
    id: "gor-logo",
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  {
    id: "gor-cover",
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  {
    id: "gor-qris",
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  {
    id: "court-images",
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  },
];

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "Skipping Supabase Storage setup: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.",
  );
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function ensureBucket(bucket) {
  const { data: existing, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    throw listError;
  }

  const found = existing?.some((item) => item.id === bucket.id);

  if (found) {
    console.log(`Bucket already exists: ${bucket.id}`);
    return;
  }

  const { error } = await supabase.storage.createBucket(bucket.id, {
    public: bucket.public,
    fileSizeLimit: bucket.fileSizeLimit,
    allowedMimeTypes: bucket.allowedMimeTypes,
  });

  if (error) {
    throw error;
  }

  console.log(`Created bucket: ${bucket.id}`);
}

for (const bucket of BUCKETS) {
  await ensureBucket(bucket);
}

console.log("Supabase Storage buckets are ready.");
