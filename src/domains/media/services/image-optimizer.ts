import sharp from "sharp";

import { MediaValidationError } from "@/domains/media/errors";
import {
  MEDIA_ERROR_MESSAGE,
  MEDIA_MAX_DIMENSION,
  MEDIA_WEBP_QUALITY,
  type MediaKind,
} from "@/domains/media/constants";

export async function optimizeImageBuffer(
  input: Buffer,
  kind: MediaKind,
): Promise<Buffer> {
  try {
    const image = sharp(input, { failOn: "none" }).rotate();
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new MediaValidationError(MEDIA_ERROR_MESSAGE.INVALID_FORMAT);
    }

    const maxDimension = MEDIA_MAX_DIMENSION[kind];

    return image
      .resize({
        width: maxDimension,
        height: maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: MEDIA_WEBP_QUALITY,
        effort: 4,
      })
      .toBuffer();
  } catch (error) {
    if (error instanceof MediaValidationError) {
      throw error;
    }

    throw new MediaValidationError(MEDIA_ERROR_MESSAGE.INVALID_FORMAT);
  }
}
