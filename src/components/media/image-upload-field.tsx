"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Replace,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  GOR_COVER_MAX_IMAGES,
  MEDIA_ALLOWED_MIME_TYPES,
  MEDIA_ERROR_MESSAGE,
  MEDIA_KIND,
  type MediaKind,
} from "@/domains/media/constants";
import {
  getMaxFileBytes,
  getMaxFileMegabytes,
  getMimeTypeFromFileName,
  MEDIA_ACCEPT_ATTRIBUTE,
} from "@/domains/media/utils/validate-media-file";
import { cn } from "@/lib/utils";

type ImageUploadFieldProps = {
  label: string;
  description?: string;
  kind: Exclude<MediaKind, typeof MEDIA_KIND.COVER>;
  imageUrl: string | null;
  disabled?: boolean;
  previewClassName?: string;
  onUploadFile: (file: File) => Promise<string>;
  onUploaded: (url: string) => void;
};

function validateClientFile(file: File, kind: ImageUploadFieldProps["kind"]) {
  const mimeType = file.type || getMimeTypeFromFileName(file.name);

  if (
    !mimeType ||
    !MEDIA_ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof MEDIA_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return MEDIA_ERROR_MESSAGE.INVALID_FORMAT;
  }

  if (file.size > getMaxFileBytes(kind)) {
    return MEDIA_ERROR_MESSAGE.FILE_TOO_LARGE(getMaxFileMegabytes(kind));
  }

  return null;
}

export function ImageUploadField({
  label,
  description,
  kind,
  imageUrl,
  disabled = false,
  previewClassName,
  onUploadFile,
  onUploaded,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSelectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationError = validateClientFile(file, kind);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const url = await onUploadFile(file);
        onUploaded(url);
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : MEDIA_ERROR_MESSAGE.UPLOAD_FAILED,
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <div>
        <Label>{label}</Label>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-start gap-4">
        {imageUrl ? (
          <div
            className={cn(
              "border-border bg-muted/30 relative overflow-hidden rounded-lg border",
              previewClassName ?? "size-24",
            )}
          >
            <Image
              src={imageUrl}
              alt={`Pratinjau ${label}`}
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
        ) : (
          <div
            className={cn(
              "border-border bg-muted/20 text-muted-foreground flex items-center justify-center rounded-lg border border-dashed text-xs",
              previewClassName ?? "size-24",
            )}
          >
            Belum ada
          </div>
        )}

        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={MEDIA_ACCEPT_ATTRIBUTE}
            className="sr-only"
            disabled={disabled || isPending}
            onChange={handleSelectFile}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isPending}
            onClick={() => inputRef.current?.click()}
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-2 size-4" />
            )}
            {imageUrl ? "Ganti Gambar" : "Unggah"}
          </Button>
          <p className="text-muted-foreground text-xs">
            PNG, JPG, atau WEBP · maks. {getMaxFileMegabytes(kind)} MB
          </p>
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type CoverGalleryManagerProps = {
  images: string[];
  disabled?: boolean;
  onAdd: (file: File) => Promise<string[]>;
  onReplace: (file: File, index: number) => Promise<string[]>;
  onDelete: (url: string) => Promise<string[]>;
  onReorder: (images: string[]) => Promise<string[]>;
  onChange: (images: string[]) => void;
};

function validateCoverFile(file: File) {
  const mimeType = file.type || getMimeTypeFromFileName(file.name);

  if (
    !mimeType ||
    !MEDIA_ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof MEDIA_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return MEDIA_ERROR_MESSAGE.INVALID_FORMAT;
  }

  if (file.size > getMaxFileBytes(MEDIA_KIND.COVER)) {
    return MEDIA_ERROR_MESSAGE.FILE_TOO_LARGE(
      getMaxFileMegabytes(MEDIA_KIND.COVER),
    );
  }

  return null;
}

export function CoverGalleryManager({
  images,
  disabled = false,
  onAdd,
  onReplace,
  onDelete,
  onReorder,
  onChange,
}: CoverGalleryManagerProps) {
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canAddMore = images.length < GOR_COVER_MAX_IMAGES;

  function runAction(key: string, action: () => Promise<string[]>) {
    setError(null);
    setPendingKey(key);

    startTransition(async () => {
      try {
        const nextImages = await action();
        onChange(nextImages);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : MEDIA_ERROR_MESSAGE.UPLOAD_FAILED,
        );
      } finally {
        setPendingKey(null);
        setReplaceIndex(null);
      }
    });
  }

  function handleAddFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationError = validateCoverFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    runAction("add", () => onAdd(file));
  }

  function handleReplaceFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || replaceIndex == null) {
      return;
    }

    const validationError = validateCoverFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    const index = replaceIndex;
    runAction(`replace-${index}`, () => onReplace(file, index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= images.length) {
      return;
    }

    const nextImages = [...images];
    const [moved] = nextImages.splice(index, 1);

    if (!moved) {
      return;
    }

    nextImages.splice(targetIndex, 0, moved);

    runAction(`move-${index}`, () => onReorder(nextImages));
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Foto Sampul</Label>
        <p className="text-muted-foreground text-sm">
          Unggah hingga {GOR_COVER_MAX_IMAGES} foto untuk ditampilkan di halaman
          venue.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((imageUrl, index) => (
          <div
            key={imageUrl}
            className="border-border space-y-2 rounded-lg border p-2"
          >
            <div className="bg-muted/30 relative aspect-[16/10] overflow-hidden rounded-md">
              <Image
                src={imageUrl}
                alt={`Foto sampul ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 240px"
                loading="lazy"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled || isPending || index === 0}
                onClick={() => moveImage(index, -1)}
                aria-label="Pindah ke kiri"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled || isPending || index === images.length - 1}
                onClick={() => moveImage(index, 1)}
                aria-label="Pindah ke kanan"
              >
                <ArrowRight className="size-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled || isPending}
                onClick={() => {
                  setReplaceIndex(index);
                  replaceInputRef.current?.click();
                }}
              >
                {pendingKey === `replace-${index}` ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Replace className="size-4" />
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled || isPending}
                onClick={() =>
                  runAction(`delete-${index}`, () => onDelete(imageUrl))
                }
              >
                {pendingKey === `delete-${index}` ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={addInputRef}
        type="file"
        accept={MEDIA_ACCEPT_ATTRIBUTE}
        className="sr-only"
        disabled={disabled || isPending || !canAddMore}
        onChange={handleAddFile}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept={MEDIA_ACCEPT_ATTRIBUTE}
        className="sr-only"
        disabled={disabled || isPending}
        onChange={handleReplaceFile}
      />

      {canAddMore ? (
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isPending}
          onClick={() => addInputRef.current?.click()}
        >
          {pendingKey === "add" ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <ImagePlus className="mr-2 size-4" />
          )}
          Tambah Foto ({images.length}/{GOR_COVER_MAX_IMAGES})
        </Button>
      ) : null}

      <p className="text-muted-foreground text-xs">
        PNG, JPG, atau WEBP · maks. {getMaxFileMegabytes(MEDIA_KIND.COVER)} MB
        per foto
      </p>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
