export type TimeInterval = {
  startMinute: number;
  endMinute: number;
};

export type AvailableSlot = TimeInterval & {
  price: number;
};

export type GetAvailabilityParams = {
  courtId: string;
  date: Date;
};

export type PriceRuleWindow = TimeInterval & {
  price: number;
};

export type OperatingHoursWindow = TimeInterval;
