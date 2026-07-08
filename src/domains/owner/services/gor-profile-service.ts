import {
  GOR_DEFAULT_CURRENCY,
  GOR_DEFAULT_TIMEZONE,
} from "@/domains/owner/constants";
import {
  GorProfileValidationError,
  GorSlugConflictError,
  OwnerNotFoundError,
} from "@/domains/owner/errors";
import { GorRepository } from "@/domains/owner/repositories/gor-repository";
import type {
  GorProfileData,
  UpdateGorProfileInput,
} from "@/domains/owner/types";
import {
  generateSlugFromName,
  resolveUniqueSlug,
} from "@/domains/owner/utils/slug";

export class GorProfileService {
  constructor(private readonly gorRepository: GorRepository) {}

  async getForUser(userId: string): Promise<GorProfileData | null> {
    const owner = await this.gorRepository.findOwnerWithGorByUserId(userId);

    if (!owner) {
      throw new OwnerNotFoundError();
    }

    return owner.gor;
  }

  async updateForUser(
    userId: string,
    input: UpdateGorProfileInput,
  ): Promise<GorProfileData> {
    const owner = await this.gorRepository.findOwnerWithGorByUserId(userId);

    if (!owner) {
      throw new OwnerNotFoundError();
    }

    const baseSlug = generateSlugFromName(input.name);
    const slug = owner.gor
      ? owner.gor.slug
      : resolveUniqueSlug(
          baseSlug,
          new Set(await this.gorRepository.findSlugsMatchingPrefix(baseSlug)),
        );

    const profileData = {
      name: input.name.trim(),
      slug,
      phone: normalizeOptionalString(input.phone),
      email: normalizeOptionalString(input.email),
      address: input.address.trim(),
      city: input.city.trim(),
      province: input.province.trim(),
      description: normalizeOptionalString(input.description),
      timezone: input.timezone,
      bankName: normalizeOptionalString(input.bankName),
      bankAccountNumber: normalizeOptionalString(input.bankAccountNumber),
      bankAccountHolder: normalizeOptionalString(input.bankAccountHolder),
    };

    if (!profileData.name) {
      throw new GorProfileValidationError("GOR name is required.");
    }

    if (!profileData.address) {
      throw new GorProfileValidationError("Address is required.");
    }

    try {
      if (owner.gor) {
        return await this.gorRepository.updateGorProfile(
          owner.gor.id,
          profileData,
        );
      }

      return await this.gorRepository.createGorProfile(owner.id, {
        ...profileData,
        logoUrl: null,
        coverImageUrl: null,
        qrisImageUrl: null,
        currency: GOR_DEFAULT_CURRENCY,
        isActive: true,
        timezone: profileData.timezone || GOR_DEFAULT_TIMEZONE,
      });
    } catch (error) {
      if (isUniqueSlugViolation(error)) {
        throw new GorSlugConflictError();
      }

      throw error;
    }
  }
}

function normalizeOptionalString(value?: string | null): string | null {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function isUniqueSlugViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export function createGorProfileService(
  gorRepository: GorRepository,
): GorProfileService {
  return new GorProfileService(gorRepository);
}
