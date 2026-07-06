export const USER_ROLE = {
  OWNER: "OWNER",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const FIRST_SUPER_ADMIN_EMAIL = "mfathna18@gmail.com" as const;
