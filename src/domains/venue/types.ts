export type PublicVenueCourt = {
  id: string;
  name: string;
  sportType: string;
  sportLabel: string;
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
  description: string | null;
  sports: {
    type: string;
    label: string;
  }[];
  courts: PublicVenueCourt[];
  openHours: PublicVenueOpenHours[];
};

export type VenueOperatingHoursRecord = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  isActive: boolean;
};

export type VenueCourtRecord = {
  id: string;
  name: string;
  sportType: string;
  isActive: boolean;
  displayOrder: number;
  operatingHours: VenueOperatingHoursRecord[];
};

export type VenueRecord = {
  id: string;
  name: string;
  slug: string;
  address: string;
  description: string | null;
  courts: VenueCourtRecord[];
};
