import { createClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import { MEDIA_ERROR_MESSAGE } from "@/domains/media/constants";
import { MediaStorageError } from "@/domains/media/errors";

export function getSupabaseConfig() {
  const url = env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new MediaStorageError(MEDIA_ERROR_MESSAGE.STORAGE_UNAVAILABLE);
  }

  return {
    url,
    serviceRoleKey,
  };
}

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
