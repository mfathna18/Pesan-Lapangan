export const OWNER_ROLE = "OWNER" as const;

export const GOR_DEFAULT_TIMEZONE = "Asia/Jakarta" as const;
export const GOR_DEFAULT_CURRENCY = "IDR" as const;

export const GOR_TIMEZONE_OPTIONS = [
  { value: "Asia/Jakarta", label: "WIB — Asia/Jakarta" },
  { value: "Asia/Makassar", label: "WITA — Asia/Makassar" },
  { value: "Asia/Jayapura", label: "WIT — Asia/Jayapura" },
] as const;

export const GOR_TIMEZONE_VALUES = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
] as const;
