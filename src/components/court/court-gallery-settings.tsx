"use client";

import { useEffect, useState } from "react";

import { ImageGalleryManager } from "@/components/media/image-upload-field";
import {
  deleteCourtImageAction,
  reorderCourtImagesAction,
  replaceCourtImageAction,
  uploadCourtImageAction,
} from "@/domains/media/actions/upload-court-media.action";

type CourtGallerySettingsProps = {
  courtId: string;
  initialImages: string[];
  disabled?: boolean;
  onImagesChange?: (images: string[]) => void;
};

export function CourtGallerySettings({
  courtId,
  initialImages,
  disabled = false,
  onImagesChange,
}: CourtGallerySettingsProps) {
  const [images, setImages] = useState(initialImages);

  useEffect(() => {
    setImages(initialImages);
  }, [courtId, initialImages]);

  function updateImages(nextImages: string[]) {
    setImages(nextImages);
    onImagesChange?.(nextImages);
  }

  async function addImage(file: File) {
    const formData = new FormData();
    formData.set("courtId", courtId);
    formData.set("file", file);

    const result = await uploadCourtImageAction(formData);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data.imageUrls;
  }

  async function replaceImage(file: File, index: number) {
    const formData = new FormData();
    formData.set("courtId", courtId);
    formData.set("file", file);
    formData.set("index", String(index));

    const result = await replaceCourtImageAction(formData);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data.imageUrls;
  }

  async function deleteImage(url: string) {
    const result = await deleteCourtImageAction(courtId, url);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data.imageUrls;
  }

  async function reorderImages(nextImages: string[]) {
    const result = await reorderCourtImagesAction(courtId, nextImages);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data.imageUrls;
  }

  return (
    <ImageGalleryManager
      images={images}
      disabled={disabled}
      onAdd={addImage}
      onReplace={replaceImage}
      onDelete={deleteImage}
      onReorder={reorderImages}
      onChange={updateImages}
    />
  );
}
