import { GorNotFoundError } from "@/domains/owner/errors";
import { GorRepository } from "@/domains/owner/repositories/gor-repository";
import type { PublicGorRecord } from "@/domains/owner/types";

export class GorService {
  constructor(private readonly gorRepository: GorRepository) {}

  async getPublicGorBySlug(slug: string): Promise<PublicGorRecord> {
    const gor = await this.gorRepository.findPublicGorBySlug(slug);

    if (!gor || !gor.isActive) {
      throw new GorNotFoundError(`GOR not found: ${slug}`);
    }

    return gor;
  }
}

export function createGorService(gorRepository: GorRepository): GorService {
  return new GorService(gorRepository);
}
