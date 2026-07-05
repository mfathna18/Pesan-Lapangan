import type { MediaBucket } from "@/domains/media/constants";
import { getSupabaseConfig } from "@/lib/supabase/admin";

const PUBLIC_OBJECT_MARKER = "/storage/v1/object/public/";

export function buildPublicStorageUrl(
  bucket: MediaBucket,
  storagePath: string,
): string {
  const baseUrl = getSupabaseConfig().url.replace(/\/$/, "");

  return `${baseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
}

export function parsePublicStorageUrl(
  publicUrl: string,
): { bucket: MediaBucket; storagePath: string } | null {
  const markerIndex = publicUrl.indexOf(PUBLIC_OBJECT_MARKER);

  if (markerIndex === -1) {
    return null;
  }

  const remainder = publicUrl.slice(markerIndex + PUBLIC_OBJECT_MARKER.length);
  const separatorIndex = remainder.indexOf("/");

  if (separatorIndex === -1) {
    return null;
  }

  const bucket = remainder.slice(0, separatorIndex);
  const storagePath = remainder.slice(separatorIndex + 1);

  if (!bucket || !storagePath) {
    return null;
  }

  return {
    bucket: bucket as MediaBucket,
    storagePath,
  };
}

export function isOwnerStoragePath(
  storagePath: string,
  ownerId: string,
): boolean {
  return storagePath === ownerId || storagePath.startsWith(`${ownerId}/`);
}

export function isSupabasePublicUrl(publicUrl: string): boolean {
  try {
    const url = new URL(publicUrl);
    const supabaseHost = new URL(getSupabaseConfig().url).host;

    return url.host === supabaseHost;
  } catch {
    return false;
  }
}
