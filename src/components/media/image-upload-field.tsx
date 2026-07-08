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
  COURT_GALLERY_MAX_IMAGES,
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
import { optimizeImageFile } from "@/domains/media/utils/client-image-optimizer";
import { cn } from "@/lib/utils";

function mapOptimizeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === "INVALID_IMAGE") {
      return MEDIA_ERROR_MESSAGE.INVALID_FORMAT;
    }

    if (error.message === "OPTIMIZE_FAILED") {
      return MEDIA_ERROR_MESSAGE.UPLOAD_FAILED;
    }
  }

  return MEDIA_ERROR_MESSAGE.UPLOAD_FAILED;
}

type SingleImageKind =
  typeof MEDIA_KIND.LOGO | typeof MEDIA_KIND.COVER | typeof MEDIA_KIND.QRIS;

type ImageUploadFieldProps = {
  label: string;
  description?: string;
  kind: SingleImageKind;
  imageUrl: string | null;
  disabled?: boolean;
  previewClassName?: string;
  onUploadFile: (file: File) => Promise<string>;
  onUploaded: (url: string | null) => void;
  onDelete?: () => Promise<void>;
};

function validateClientFile(file: File, kind: MediaKind) {
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
  onDelete,
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
        const optimizedFile = await optimizeImageFile({ file, kind });
        const url = await onUploadFile(optimizedFile);
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

  function handleDelete() {
    if (!onDelete) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await onDelete();
        onUploaded(null);
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : MEDIA_ERROR_MESSAGE.DELETE_FAILED,
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
              sizes="320px"
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
          <div className="flex flex-wrap gap-2">
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
            {imageUrl && onDelete ? (
              <Button
                type="button"
                variant="outline"
                disabled={disabled || isPending}
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 size-4" />
                Hapus
              </Button>
            ) : null}
          </div>
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

type ImageGalleryManagerProps = {
  label?: string;
  description?: string;
  images: string[];
  maxImages?: number;
  kind?: typeof MEDIA_KIND.COURT;
  disabled?: boolean;
  onAdd: (file: File) => Promise<string[]>;
  onReplace: (file: File, index: number) => Promise<string[]>;
  onDelete: (url: string) => Promise<string[]>;
  onReorder: (images: string[]) => Promise<string[]>;
  onChange: (images: string[]) => void;
};

export function ImageGalleryManager({
  label = "Galeri Lapangan",
  description = `Unggah hingga ${COURT_GALLERY_MAX_IMAGES} foto lapangan untuk ditampilkan ke pelanggan.`,
  images,
  maxImages = COURT_GALLERY_MAX_IMAGES,
  kind = MEDIA_KIND.COURT,
  disabled = false,
  onAdd,
  onReplace,
  onDelete,
  onReorder,
  onChange,
}: ImageGalleryManagerProps) {
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canAddMore = images.length < maxImages;

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
            : mapOptimizeError(actionError),
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

    const validationError = validateClientFile(file, kind);

    if (validationError) {
      setError(validationError);
      return;
    }

    runAction("add", async () => {
      const optimizedFile = await optimizeImageFile({ file, kind });
      return onAdd(optimizedFile);
    });
  }

  function handleReplaceFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || replaceIndex == null) {
      return;
    }

    const validationError = validateClientFile(file, kind);

    if (validationError) {
      setError(validationError);
      return;
    }

    const index = replaceIndex;
    runAction(`replace-${index}`, async () => {
      const optimizedFile = await optimizeImageFile({ file, kind });
      return onReplace(optimizedFile, index);
    });
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
        <Label>{label}</Label>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((imageUrl, index) => (
          <div
            key={imageUrl}
            className="border-border space-y-2 rounded-lg border p-2"
          >
            <div className="bg-muted/30 relative aspect-[16/10] overflow-hidden rounded-md">
              <Image
                src={imageUrl}
                alt={`Foto ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 240px"
                loading="lazy"
              />
              {pendingKey?.startsWith("replace-") ||
              pendingKey?.startsWith("delete-") ||
              pendingKey?.startsWith("move-") ||
              pendingKey === "add" ? (
                pendingKey === `replace-${index}` ||
                pendingKey === `delete-${index}` ||
                pendingKey === `move-${index}` ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                    <Loader2 className="size-5 animate-spin text-white" />
                  </div>
                ) : null
              ) : null}
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
          Tambah Foto ({images.length}/{maxImages})
        </Button>
      ) : null}

      <p className="text-muted-foreground text-xs">
        PNG, JPG, atau WEBP · maks. {getMaxFileMegabytes(kind)} MB per foto
      </p>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
