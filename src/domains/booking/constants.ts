export const BOOKING_DURATION_INTERVAL_MINUTES = 60 as const;

export const BOOKING_NUMBER_PREFIX = "BK" as const;

export const BOOKING_NUMBER_SEQUENCE_LENGTH = 4 as const;

export const BOOKING_LIST_DEFAULT_PAGE_SIZE = 10 as const;

export const BOOKING_LIST_MAX_PAGE_SIZE = 50 as const;

export const BOOKING_LIST_SORT = {
  NEWEST: "newest",
  OLDEST: "oldest",
} as const;

export const ANALYTICS_TOP_COURTS_LIMIT = 10 as const;

export const DAY_OF_WEEK_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
