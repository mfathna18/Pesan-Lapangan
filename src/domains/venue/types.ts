export type PublicVenueListItem = {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
};

export type PublicVenueCourt = {
  id: string;
  name: string;
  sportType: string;
  sportLabel: string;
  isActive: boolean;
};

export type PublicVenueOpenHours = {
  dayOfWeek: number;
  dayLabel: string;
  hours: string;
};

export type PublicVenueData = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  sports: {
    type: string;
    label: string;
  }[];
  courts: PublicVenueCourt[];
  openHours: PublicVenueOpenHours[];
};
