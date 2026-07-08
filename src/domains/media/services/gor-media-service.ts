import {
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
import { prepareUploadBuffer } from "@/domains/media/services/image-optimizer";
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
    courtId?: string,
  ): Promise<MediaUploadResult> {
    validateMediaFile(file, kind);

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    validateMediaBuffer(inputBuffer, kind);

    const optimizedBuffer = await prepareUploadBuffer(inputBuffer, kind);
    const bucket = getMediaBucket(kind);
    const fileId = crypto.randomUUID();
    const storagePath = buildMediaStoragePath(ownerId, kind, fileId, courtId);
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
          : `${MEDIA_ERROR_MESSAGE.UPLOAD_FAILED} (${error.message})`,
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
    kind: Exclude<MediaKind, typeof MEDIA_KIND.COURT>,
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
          coverImageUrl: string | null;
          qrisImageUrl: string | null;
        } | null;
      } | null>;
      updateGorLogo: (gorId: string, logoUrl: string | null) => Promise<void>;
      updateGorQris: (
        gorId: string,
        qrisImageUrl: string | null,
      ) => Promise<void>;
      updateGorCoverImage: (
        gorId: string,
        coverImageUrl: string | null,
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

  async uploadCover(userId: string, file: File) {
    const { ownerId, gor } = await this.requireOwnedGor(userId);
    const uploaded = await this.mediaStorageService.replaceImage(
      ownerId,
      MEDIA_KIND.COVER,
      file,
      gor.coverImageUrl,
    );

    await this.gorRepository.updateGorCoverImage(gor.id, uploaded.publicUrl);

    return uploaded.publicUrl;
  }

  async deleteCover(userId: string) {
    const { ownerId, gor } = await this.requireOwnedGor(userId);

    if (!gor.coverImageUrl) {
      throw new MediaValidationError(MEDIA_ERROR_MESSAGE.INVALID_COVER_URL);
    }

    const previousUrl = gor.coverImageUrl;

    await this.gorRepository.updateGorCoverImage(gor.id, null);
    await this.mediaStorageService.deleteByPublicUrl(previousUrl, ownerId);

    return null;
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
