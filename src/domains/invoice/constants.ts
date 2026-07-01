export const INVOICE_STATUS = {
  GENERATED: "GENERATED",
  VOID: "VOID",
} as const;

export const INVOICE_NUMBER_PREFIX = "INV" as const;

export const INVOICE_NUMBER_SEQUENCE_LENGTH = 4 as const;

export const INVOICE_LIST_DEFAULT_PAGE_SIZE = 20 as const;

export const PAYMENT_STATUS_FOR_INVOICE = "PAID" as const;
