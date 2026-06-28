export type TimeInterval = {
  startMinute: number;
  endMinute: number;
};

export type AvailabilitySlot = {
  startMinute: number;
  endMinute: number;
  price: number;
  available: boolean;
};

export type AvailableSlot = AvailabilitySlot;

export type GetAvailabilityParams = {
  courtId: string;
  date: Date;
};

export type PriceRuleWindow = TimeInterval & {
  price: number;
};

export type OperatingHoursWindow = TimeInterval;

export type OperatingHoursRecord = TimeInterval & {
  dayOfWeek: number;
  isActive: boolean;
};
