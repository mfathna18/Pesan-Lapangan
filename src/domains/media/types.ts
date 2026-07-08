import type { MediaKind } from "@/domains/media/constants";

export type MediaUploadResult = {
  publicUrl: string;
  storagePath: string;
};

export type GorMediaState = {
  logoUrl: string | null;
  coverImageUrl: string | null;
  qrisImageUrl: string | null;
};

export type UploadGorMediaInput = {
  ownerId: string;
  gorId: string;
  kind: MediaKind;
  file: File;
};
