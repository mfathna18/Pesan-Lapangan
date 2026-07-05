import { MEDIA_ERROR_MESSAGE } from "@/domains/media/constants";
import { MediaValidationError } from "@/domains/media/errors";
import type { MediaKind } from "@/domains/media/constants";
import { validateMediaBuffer } from "@/domains/media/utils/validate-media-file";

export async function prepareUploadBuffer(
  input: Buffer,
  kind: MediaKind,
): Promise<Buffer> {
  validateMediaBuffer(input, kind);

  if (input.byteLength < 12) {
    throw new MediaValidationError(MEDIA_ERROR_MESSAGE.INVALID_FORMAT);
  }

  const isWebp =
    input[0] === 0x52 &&
    input[1] === 0x49 &&
    input[2] === 0x46 &&
    input[3] === 0x46 &&
    input[8] === 0x57 &&
    input[9] === 0x45 &&
    input[10] === 0x42 &&
    input[11] === 0x50;

  const isJpeg = input[0] === 0xff && input[1] === 0xd8 && input[2] === 0xff;
  const isPng =
    input[0] === 0x89 &&
    input[1] === 0x50 &&
    input[2] === 0x4e &&
    input[3] === 0x47;

  if (!isWebp && !isJpeg && !isPng) {
    throw new MediaValidationError(MEDIA_ERROR_MESSAGE.INVALID_FORMAT);
  }

  return input;
}
