export const WHATSAPP_MESSAGE_TYPE = {
  OWNER_NEW_BOOKING: "OWNER_NEW_BOOKING",
  OWNER_PAYMENT_AWAITING: "OWNER_PAYMENT_AWAITING",
  OWNER_BOOKING_CANCELLED: "OWNER_BOOKING_CANCELLED",
  CUSTOMER_BOOKING_CREATED: "CUSTOMER_BOOKING_CREATED",
  CUSTOMER_PAYMENT_APPROVED: "CUSTOMER_PAYMENT_APPROVED",
  CUSTOMER_PAYMENT_REJECTED: "CUSTOMER_PAYMENT_REJECTED",
  CUSTOMER_BOOKING_REMINDER: "CUSTOMER_BOOKING_REMINDER",
  OWNER_SUBSCRIPTION_ACTIVATED: "OWNER_SUBSCRIPTION_ACTIVATED",
} as const;

export type WhatsAppMessageType =
  (typeof WHATSAPP_MESSAGE_TYPE)[keyof typeof WHATSAPP_MESSAGE_TYPE];

export const WHATSAPP_RECIPIENT_TYPE = {
  OWNER: "OWNER",
  CUSTOMER: "CUSTOMER",
} as const;

export type WhatsAppRecipientType =
  (typeof WHATSAPP_RECIPIENT_TYPE)[keyof typeof WHATSAPP_RECIPIENT_TYPE];

export const WHATSAPP_MESSAGE_STATUS = {
  PENDING: "PENDING",
  SENT: "SENT",
  FAILED: "FAILED",
  RETRYING: "RETRYING",
} as const;

export type WhatsAppMessageStatus =
  (typeof WHATSAPP_MESSAGE_STATUS)[keyof typeof WHATSAPP_MESSAGE_STATUS];

export const WHATSAPP_PROVIDER_NAME = {
  FONNTE: "fonnte",
  WABLAS: "wablas",
  WA_GATEWAY: "wa-gateway",
  META: "meta",
  NOOP: "noop",
} as const;

export type WhatsAppProviderName =
  (typeof WHATSAPP_PROVIDER_NAME)[keyof typeof WHATSAPP_PROVIDER_NAME];

export const WHATSAPP_MAX_RETRY_ATTEMPTS = 3;

export const WHATSAPP_REMINDER_MINUTES_BEFORE = 60;

export type WhatsAppProviderSendInput = {
  to: string;
  message: string;
};

export type WhatsAppProviderSendResult = {
  success: boolean;
  providerMessageId?: string;
  rawResponse?: string;
  errorMessage?: string;
};

export type WhatsAppProvider = {
  readonly name: WhatsAppProviderName;
  send(input: WhatsAppProviderSendInput): Promise<WhatsAppProviderSendResult>;
};

export type WhatsAppQueueJob = {
  logId: string;
  recipientPhone: string;
  messageBody: string;
  messageType: WhatsAppMessageType;
  ownerId?: string;
  bookingId?: string;
};

export type OwnerWhatsAppSettingsData = {
  enabled: boolean;
  notifyBooking: boolean;
  notifyPayment: boolean;
  notifyReminder: boolean;
  notifySubscription: boolean;
};

export type UpdateOwnerWhatsAppSettingsInput = OwnerWhatsAppSettingsData;

export type WhatsAppBookingContext = {
  ownerId: string;
  ownerName: string;
  ownerPhone: string | null;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  courtName: string;
  gorName: string;
  gorSlug: string;
  bookingDate: Date;
  startMinute: number;
  endMinute: number;
  amount: number;
  timezone: string;
};

export type WhatsAppLogEvent =
  | { type: "success"; logId: string; providerName: string; response: string }
  | { type: "failed"; logId: string; providerName: string; error: string }
  | { type: "retry"; logId: string; attempt: number; error: string };
