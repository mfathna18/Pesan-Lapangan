"use client";

import { useState } from "react";

import {
  CoverGalleryManager,
  ImageUploadField,
} from "@/components/media/image-upload-field";
import { MEDIA_KIND } from "@/domains/media/constants";
import {
  deleteGorCoverAction,
  reorderGorCoversAction,
  replaceGorCoverAction,
  uploadGorCoverAction,
  uploadGorLogoAction,
  uploadGorQrisAction,
} from "@/domains/media/actions/upload-gor-media.action";
import type { GorProfileData } from "@/domains/owner/types";

type GorMediaSettingsProps = {
  profile: GorProfileData | null;
  disabled?: boolean;
};

async function uploadLogo(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  const result = await uploadGorLogoAction(formData);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data.logoUrl;
}

async function uploadQris(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  const result = await uploadGorQrisAction(formData);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data.qrisImageUrl;
}

async function addCover(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  const result = await uploadGorCoverAction(formData);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data.coverImages;
}

async function replaceCover(file: File, index: number) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("index", String(index));

  const result = await replaceGorCoverAction(formData);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data.coverImages;
}

async function deleteCover(url: string) {
  const result = await deleteGorCoverAction(url);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data.coverImages;
}

async function reorderCovers(coverImages: string[]) {
  const result = await reorderGorCoversAction(coverImages);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data.coverImages;
}

export function GorMediaSettings({
  profile,
  disabled = false,
}: GorMediaSettingsProps) {
  const [logoUrl, setLogoUrl] = useState(profile?.logoUrl ?? null);
  const [qrisImageUrl, setQrisImageUrl] = useState(
    profile?.qrisImageUrl ?? null,
  );
  const [coverImages, setCoverImages] = useState(profile?.coverImages ?? []);

  if (!profile) {
    return (
      <p className="text-muted-foreground text-sm">
        Simpan profil GOR terlebih dahulu sebelum mengunggah gambar.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ImageUploadField
        label="Logo"
        kind={MEDIA_KIND.LOGO}
        imageUrl={logoUrl}
        disabled={disabled}
        previewClassName="size-24"
        onUploadFile={uploadLogo}
        onUploaded={setLogoUrl}
      />

      <CoverGalleryManager
        images={coverImages}
        disabled={disabled}
        onAdd={addCover}
        onReplace={replaceCover}
        onDelete={deleteCover}
        onReorder={reorderCovers}
        onChange={setCoverImages}
      />

      <ImageUploadField
        label="QRIS"
        description="Ditampilkan ke pelanggan saat checkout transfer manual."
        kind={MEDIA_KIND.QRIS}
        imageUrl={qrisImageUrl}
        disabled={disabled}
        previewClassName="aspect-square w-40"
        onUploadFile={uploadQris}
        onUploaded={setQrisImageUrl}
      />
    </div>
  );
}
