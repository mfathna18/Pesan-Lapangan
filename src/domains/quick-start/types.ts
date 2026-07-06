export const QUICK_START_STEP_ID = {
  PROFILE: "profile",
  MEDIA: "media",
  COURTS: "courts",
  OPERATING_HOURS: "operating-hours",
  PRICING: "pricing",
  PAYMENT: "payment",
  FIRST_BOOKING: "first-booking",
  NOTIFICATIONS: "notifications",
} as const;

export type QuickStartStepId =
  (typeof QUICK_START_STEP_ID)[keyof typeof QUICK_START_STEP_ID];

export type QuickStartStepStatus = {
  id: QuickStartStepId;
  completed: boolean;
};

export type QuickStartProgressData = {
  steps: QuickStartStepStatus[];
  completedCount: number;
  totalCount: number;
  percent: number;
  allComplete: boolean;
  publicGorUrl: string | null;
};
