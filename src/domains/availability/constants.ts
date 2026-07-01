export const BOOKING_INTERVAL_MINUTES = 60 as const;

export const MINUTES_PER_DAY = 1440 as const;

export const MINUTE_OF_DAY = {
  MIN: 0,
  MAX: 1439,
} as const;

export const OPERATING_HOURS_WEEKDAYS = [
  { dayOfWeek: 1, label: "Senin" },
  { dayOfWeek: 2, label: "Selasa" },
  { dayOfWeek: 3, label: "Rabu" },
  { dayOfWeek: 4, label: "Kamis" },
  { dayOfWeek: 5, label: "Jumat" },
  { dayOfWeek: 6, label: "Sabtu" },
  { dayOfWeek: 0, label: "Minggu" },
] as const;

export const OPERATING_HOURS_DEFAULT_START_MINUTE = 8 * 60;
export const OPERATING_HOURS_DEFAULT_END_MINUTE = 22 * 60;
