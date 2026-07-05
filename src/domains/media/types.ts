import type { MediaKind } from "@/domains/media/constants";

export type MediaUploadResult = {
  publicUrl: string;
  storagePath: string;
};

export type GorMediaState = {
  logoUrl: string | null;
  coverImages: string[];
  qrisImageUrl: string | null;
};

export type UploadGorMediaInput = {
  ownerId: string;
  gorId: string;
  kind: MediaKind;
  file: File;
  replaceCoverIndex?: number;
};
