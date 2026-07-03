export const BOOKING_DURATION_INTERVAL_MINUTES = 60 as const;

export const BOOKING_PENDING_EXPIRY_MINUTES = 5 as const;

/** Owner reminder threshold after customer confirms manual payment. */
export const MANUAL_PAYMENT_OWNER_REMINDER_HOURS = 12 as const;

/** Extended hold while owner reviews confirmed manual payment. */
export const BOOKING_AWAITING_CONFIRMATION_EXPIRY_HOURS = 72 as const;

export const BOOKING_SLOT_UNAVAILABLE_MESSAGE =
  "Slot waktu yang dipilih sudah tidak tersedia. Silakan pilih waktu lain." as const;

export const BOOKING_NUMBER_PREFIX = "BK" as const;

export const BOOKING_NUMBER_SEQUENCE_LENGTH = 4 as const;

export const BOOKING_LIST_DEFAULT_PAGE_SIZE = 10 as const;

export const BOOKING_LIST_MAX_PAGE_SIZE = 50 as const;

export const BOOKING_LIST_SORT = {
  NEWEST: "newest",
  OLDEST: "oldest",
} as const;

export const ANALYTICS_TOP_COURTS_LIMIT = 10 as const;

export const COURT_FACILITY_LABELS = {
  PARKING: "Parkir",
  TOILET: "Toilet",
  SHOWER: "Shower",
  CHANGING_ROOM: "Ruang Ganti",
  CAFETERIA: "Kantin",
  PRAYER_ROOM: "Mushola",
  OTHER: "Lainnya",
} as const;

export const COURT_SPORT_TYPE_VALUES = [
  "BADMINTON",
  "FUTSAL",
  "BASKETBALL",
  "VOLLEYBALL",
  "TENNIS",
  "OTHER",
] as const;

export const DAY_OF_WEEK_LABELS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;
