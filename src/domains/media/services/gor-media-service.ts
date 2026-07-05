import {
  GOR_COVER_MAX_IMAGES,
  MEDIA_ERROR_MESSAGE,
  MEDIA_KIND,
  getMediaBucket,
  type MediaKind,
} from "@/domains/media/constants";
import {
  MediaAuthorizationError,
  MediaStorageError,
  MediaValidationError,
} from "@/domains/media/errors";
import { optimizeImageBuffer } from "@/domains/media/services/image-optimizer";
import type { MediaUploadResult } from "@/domains/media/types";
import { buildMediaStoragePath } from "@/domains/media/utils/storage-path";
import {
  buildPublicStorageUrl,
  isOwnerStoragePath,
  isSupabasePublicUrl,
  parsePublicStorageUrl,
} from "@/domains/media/utils/storage-url";
import {
  validateMediaBuffer,
  validateMediaFile,
} from "@/domains/media/utils/validate-media-file";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export class MediaStorageService {
  async uploadImage(
    ownerId: string,
    kind: MediaKind,
    file: File,
  ): Promise<MediaUploadResult> {
    validateMediaFile(file, kind);

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    validateMediaBuffer(inputBuffer, kind);

    const optimizedBuffer = await optimizeImageBuffer(inputBuffer, kind);
    const bucket = getMediaBucket(kind);
    const fileId = crypto.randomUUID();
    const storagePath = buildMediaStoragePath(ownerId, kind, fileId);
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, optimizedBuffer, {
        contentType: "image/webp",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new MediaStorageError(
        error.message.includes("Bucket not found")
          ? MEDIA_ERROR_MESSAGE.STORAGE_UNAVAILABLE
          : MEDIA_ERROR_MESSAGE.UPLOAD_FAILED,
      );
    }

    return {
      publicUrl: buildPublicStorageUrl(bucket, storagePath),
      storagePath,
    };
  }

  async deleteByPublicUrl(publicUrl: string, ownerId: string): Promise<void> {
    if (!isSupabasePublicUrl(publicUrl)) {
      return;
    }

    const parsed = parsePublicStorageUrl(publicUrl);

    if (!parsed || !isOwnerStoragePath(parsed.storagePath, ownerId)) {
      throw new MediaAuthorizationError(MEDIA_ERROR_MESSAGE.UNAUTHORIZED);
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage
      .from(parsed.bucket)
      .remove([parsed.storagePath]);

    if (error) {
      throw new MediaStorageError(MEDIA_ERROR_MESSAGE.DELETE_FAILED);
    }
  }

  async replaceImage(
    ownerId: string,
    kind: Exclude<MediaKind, typeof MEDIA_KIND.COVER>,
    file: File,
    previousUrl: string | null,
  ): Promise<MediaUploadResult> {
    const uploaded = await this.uploadImage(ownerId, kind, file);

    if (previousUrl) {
      try {
        await this.deleteByPublicUrl(previousUrl, ownerId);
      } catch {
        // Keep the new upload even if old file cleanup fails.
      }
    }

    return uploaded;
  }
}

export class GorMediaService {
  constructor(
    private readonly mediaStorageService: MediaStorageService,
    private readonly gorRepository: {
      findOwnerWithGorByUserId: (userId: string) => Promise<{
        id: string;
        gor: {
          id: string;
          logoUrl: string | null;
          coverImages: string[];
          qrisImageUrl: string | null;
        } | null;
      } | null>;
      updateGorLogo: (gorId: string, logoUrl: string | null) => Promise<void>;
      updateGorQris: (
        gorId: string,
        qrisImageUrl: string | null,
      ) => Promise<void>;
      updateGorCoverImages: (
        gorId: string,
        coverImages: string[],
      ) => Promise<void>;
    },
  ) {}

  private async requireOwnedGor(userId: string) {
    const owner = await this.gorRepository.findOwnerWithGorByUserId(userId);

    if (!owner?.gor) {
      throw new MediaValidationError(MEDIA_ERROR_MESSAGE.GOR_REQUIRED);
    }

    return {
      ownerId: owner.id,
      gor: owner.gor,
    };
  }

  async uploadLogo(userId: string, file: File) {
    const { ownerId, gor } = await this.requireOwnedGor(userId);
    const uploaded = await this.mediaStorageService.replaceImage(
      ownerId,
      MEDIA_KIND.LOGO,
      file,
      gor.logoUrl,
    );

    await this.gorRepository.updateGorLogo(gor.id, uploaded.publicUrl);

    return uploaded.publicUrl;
  }

  async uploadQris(userId: string, file: File) {
    const { ownerId, gor } = await this.requireOwnedGor(userId);
    const uploaded = await this.mediaStorageService.replaceImage(
      ownerId,
      MEDIA_KIND.QRIS,
      file,
      gor.qrisImageUrl,
    );

    await this.gorRepository.updateGorQris(gor.id, uploaded.publicUrl);

    return uploaded.publicUrl;
  }

  async addCover(userId: string, file: File) {
    const { ownerId, gor } = await this.requireOwnedGor(userId);

    if (gor.coverImages.length >= GOR_COVER_MAX_IMAGES) {
      throw new MediaValidationError(MEDIA_ERROR_MESSAGE.COVER_LIMIT);
    }

    const uploaded = await this.mediaStorageService.uploadImage(
      ownerId,
      MEDIA_KIND.COVER,
      file,
    );
    const coverImages = [...gor.coverImages, uploaded.publicUrl];

    await this.gorRepository.updateGorCoverImages(gor.id, coverImages);

    return coverImages;
  }

  async replaceCover(userId: string, file: File, index: number) {
    const { ownerId, gor } = await this.requireOwnedGor(userId);
    const previousUrl = gor.coverImages[index];

    if (!previousUrl) {
      throw new MediaValidationError(MEDIA_ERROR_MESSAGE.INVALID_COVER_URL);
    }

    const uploaded = await this.mediaStorageService.uploadImage(
      ownerId,
      MEDIA_KIND.COVER,
      file,
    );
    const coverImages = [...gor.coverImages];
    coverImages[index] = uploaded.publicUrl;

    await this.gorRepository.updateGorCoverImages(gor.id, coverImages);

    try {
      await this.mediaStorageService.deleteByPublicUrl(previousUrl, ownerId);
    } catch {
      // Keep DB update even if old file cleanup fails.
    }

    return coverImages;
  }

  async deleteCover(userId: string, publicUrl: string) {
    const { ownerId, gor } = await this.requireOwnedGor(userId);

    if (!gor.coverImages.includes(publicUrl)) {
      throw new MediaValidationError(MEDIA_ERROR_MESSAGE.INVALID_COVER_URL);
    }

    const coverImages = gor.coverImages.filter((url) => url !== publicUrl);

    await this.gorRepository.updateGorCoverImages(gor.id, coverImages);
    await this.mediaStorageService.deleteByPublicUrl(publicUrl, ownerId);

    return coverImages;
  }

  async reorderCovers(userId: string, coverImages: string[]) {
    const { gor } = await this.requireOwnedGor(userId);

    if (coverImages.length !== gor.coverImages.length) {
      throw new MediaValidationError(MEDIA_ERROR_MESSAGE.INVALID_COVER_URL);
    }

    const currentSet = new Set(gor.coverImages);

    if (!coverImages.every((url) => currentSet.has(url))) {
      throw new MediaValidationError(MEDIA_ERROR_MESSAGE.INVALID_COVER_URL);
    }

    await this.gorRepository.updateGorCoverImages(gor.id, coverImages);

    return coverImages;
  }
}

export function createMediaStorageService(): MediaStorageService {
  return new MediaStorageService();
}

export function createGorMediaService(
  gorRepository: ConstructorParameters<typeof GorMediaService>[1],
): GorMediaService {
  return new GorMediaService(createMediaStorageService(), gorRepository);
}
