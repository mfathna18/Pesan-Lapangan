import {
  COURT_GALLERY_MAX_IMAGES,
  MEDIA_ERROR_MESSAGE,
  MEDIA_KIND,
} from "@/domains/media/constants";
import { MediaValidationError } from "@/domains/media/errors";
import {
  createMediaStorageService,
  type MediaStorageService,
} from "@/domains/media/services/gor-media-service";

type CourtMediaRepository = {
  findByIdForOwner: (
    courtId: string,
    ownerId: string,
  ) => Promise<{
    id: string;
    imageUrls: string[];
  } | null>;
  updateImageUrlsForOwner: (
    courtId: string,
    ownerId: string,
    imageUrls: string[],
  ) => Promise<{ id: string; imageUrls: string[] } | null>;
};

type OwnerLookup = {
  findOwnerIdByUserId: (userId: string) => Promise<string | null>;
};

export class CourtMediaService {
  constructor(
    private readonly mediaStorageService: MediaStorageService,
    private readonly courtRepository: CourtMediaRepository,
    private readonly ownerLookup: OwnerLookup,
  ) {}

  private async requireOwnedCourt(userId: string, courtId: string) {
    const ownerId = await this.ownerLookup.findOwnerIdByUserId(userId);

    if (!ownerId) {
      throw new MediaValidationError(MEDIA_ERROR_MESSAGE.COURT_REQUIRED);
    }

    const court = await this.courtRepository.findByIdForOwner(courtId, ownerId);

    if (!court) {
      throw new MediaValidationError(MEDIA_ERROR_MESSAGE.COURT_REQUIRED);
    }

    return { ownerId, court };
  }

  async addImage(userId: string, courtId: string, file: File) {
    const { ownerId, court } = await this.requireOwnedCourt(userId, courtId);

    if (court.imageUrls.length >= COURT_GALLERY_MAX_IMAGES) {
      throw new MediaValidationError(MEDIA_ERROR_MESSAGE.COURT_GALLERY_LIMIT);
    }

    const uploaded = await this.mediaStorageService.uploadImage(
      ownerId,
      MEDIA_KIND.COURT,
      file,
      courtId,
    );
    const imageUrls = [...court.imageUrls, uploaded.publicUrl];
    const updated = await this.courtRepository.updateImageUrlsForOwner(
      courtId,
      ownerId,
      imageUrls,
    );

    return updated?.imageUrls ?? imageUrls;
  }

  async replaceImage(
    userId: string,
    courtId: string,
    file: File,
    index: number,
  ) {
    const { ownerId, court } = await this.requireOwnedCourt(userId, courtId);
    const previousUrl = court.imageUrls[index];

    if (!previousUrl) {
      throw new MediaValidationError(
        MEDIA_ERROR_MESSAGE.INVALID_COURT_IMAGE_URL,
      );
    }

    const uploaded = await this.mediaStorageService.uploadImage(
      ownerId,
      MEDIA_KIND.COURT,
      file,
      courtId,
    );
    const imageUrls = [...court.imageUrls];
    imageUrls[index] = uploaded.publicUrl;

    const updated = await this.courtRepository.updateImageUrlsForOwner(
      courtId,
      ownerId,
      imageUrls,
    );

    try {
      await this.mediaStorageService.deleteByPublicUrl(previousUrl, ownerId);
    } catch {
      // Keep DB update even if old file cleanup fails.
    }

    return updated?.imageUrls ?? imageUrls;
  }

  async deleteImage(userId: string, courtId: string, publicUrl: string) {
    const { ownerId, court } = await this.requireOwnedCourt(userId, courtId);

    if (!court.imageUrls.includes(publicUrl)) {
      throw new MediaValidationError(
        MEDIA_ERROR_MESSAGE.INVALID_COURT_IMAGE_URL,
      );
    }

    const imageUrls = court.imageUrls.filter((url) => url !== publicUrl);
    const updated = await this.courtRepository.updateImageUrlsForOwner(
      courtId,
      ownerId,
      imageUrls,
    );

    await this.mediaStorageService.deleteByPublicUrl(publicUrl, ownerId);

    return updated?.imageUrls ?? imageUrls;
  }

  async reorderImages(userId: string, courtId: string, imageUrls: string[]) {
    const { ownerId, court } = await this.requireOwnedCourt(userId, courtId);

    if (imageUrls.length !== court.imageUrls.length) {
      throw new MediaValidationError(
        MEDIA_ERROR_MESSAGE.INVALID_COURT_IMAGE_URL,
      );
    }

    const currentSet = new Set(court.imageUrls);

    if (!imageUrls.every((url) => currentSet.has(url))) {
      throw new MediaValidationError(
        MEDIA_ERROR_MESSAGE.INVALID_COURT_IMAGE_URL,
      );
    }

    const updated = await this.courtRepository.updateImageUrlsForOwner(
      courtId,
      ownerId,
      imageUrls,
    );

    return updated?.imageUrls ?? imageUrls;
  }
}

export function createCourtMediaService(
  courtRepository: CourtMediaRepository,
  ownerLookup: OwnerLookup,
): CourtMediaService {
  return new CourtMediaService(
    createMediaStorageService(),
    courtRepository,
    ownerLookup,
  );
}
