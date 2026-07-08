"use client";

import { useState } from "react";

import { ImageUploadField } from "@/components/media/image-upload-field";
import { MEDIA_KIND } from "@/domains/media/constants";
import {
  deleteGorCoverAction,
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

async function uploadCover(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  const result = await uploadGorCoverAction(formData);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data.coverImageUrl;
}

async function deleteCover() {
  const result = await deleteGorCoverAction();

  if (!result.success) {
    throw new Error(result.error);
  }
}

export function GorMediaSettings({
  profile,
  disabled = false,
}: GorMediaSettingsProps) {
  const [logoUrl, setLogoUrl] = useState(profile?.logoUrl ?? null);
  const [qrisImageUrl, setQrisImageUrl] = useState(
    profile?.qrisImageUrl ?? null,
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    profile?.coverImageUrl ?? null,
  );

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

      <ImageUploadField
        label="Foto Sampul"
        description="Satu foto sampul untuk homepage, halaman venue, dan hasil pencarian."
        kind={MEDIA_KIND.COVER}
        imageUrl={coverImageUrl}
        disabled={disabled}
        previewClassName="aspect-[16/10] w-56"
        onUploadFile={uploadCover}
        onUploaded={setCoverImageUrl}
        onDelete={deleteCover}
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
