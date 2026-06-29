import type { OWNER_ROLE } from "@/domains/owner/constants";

export type OwnerRole = typeof OWNER_ROLE;

export type PublicGorRecord = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  isActive: boolean;
};

export type GorProfileRecord = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string;
  city: string;
  province: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  timezone: string;
  currency: string;
  isActive: boolean;
};

export type GorProfileData = GorProfileRecord;

export type UpdateGorProfileInput = {
  name: string;
  phone?: string | null;
  email?: string | null;
  address: string;
  city: string;
  province: string;
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  timezone: string;
};

export type OwnerWithGorRecord = {
  id: string;
  userId: string;
  gor: GorProfileRecord | null;
};
