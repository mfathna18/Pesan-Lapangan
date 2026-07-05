import {
  MEDIA_ALLOWED_MIME_TYPES,
  MEDIA_ERROR_MESSAGE,
  MEDIA_KIND,
  MEDIA_MAX_FILE_BYTES,
  type MediaKind,
} from "@/domains/media/constants";
import { MediaValidationError } from "@/domains/media/errors";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export function getMimeTypeFromFileName(fileName: string): string | null {
  const lowerName = fileName.toLowerCase();
  const extension = Object.keys(MIME_BY_EXTENSION).find((suffix) =>
    lowerName.endsWith(suffix),
  );

  return extension ? (MIME_BY_EXTENSION[extension] ?? null) : null;
}

export function validateMediaFile(
  file: File,
  kind: MediaKind,
): asserts file is File {
  const mimeType = file.type || getMimeTypeFromFileName(file.name);

  if (
    !mimeType ||
    !MEDIA_ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof MEDIA_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    throw new MediaValidationError(MEDIA_ERROR_MESSAGE.INVALID_FORMAT);
  }

  const maxBytes = MEDIA_MAX_FILE_BYTES[kind];

  if (file.size > maxBytes) {
    const maxMb = maxBytes / (1024 * 1024);

    throw new MediaValidationError(MEDIA_ERROR_MESSAGE.FILE_TOO_LARGE(maxMb));
  }
}

export function validateMediaBuffer(buffer: Buffer, kind: MediaKind): void {
  if (buffer.byteLength > MEDIA_MAX_FILE_BYTES[kind]) {
    const maxMb = MEDIA_MAX_FILE_BYTES[kind] / (1024 * 1024);

    throw new MediaValidationError(MEDIA_ERROR_MESSAGE.FILE_TOO_LARGE(maxMb));
  }

  if (buffer.byteLength === 0) {
    throw new MediaValidationError(MEDIA_ERROR_MESSAGE.INVALID_FORMAT);
  }
}

export function getMaxFileBytes(kind: MediaKind): number {
  return MEDIA_MAX_FILE_BYTES[kind];
}

export function getMaxFileMegabytes(kind: MediaKind): number {
  return MEDIA_MAX_FILE_BYTES[kind] / (1024 * 1024);
}

export const MEDIA_ACCEPT_ATTRIBUTE = "image/png,image/jpeg,image/webp";

export const MEDIA_KIND_LABEL = {
  [MEDIA_KIND.LOGO]: "logo",
  [MEDIA_KIND.COVER]: "foto sampul",
  [MEDIA_KIND.QRIS]: "QRIS",
} as const;
