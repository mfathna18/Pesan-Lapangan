import type {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/client";

import type { RevenueDateRangePreset } from "@/domains/payment/constants";

export type PublicPaymentSummary = {
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
  method: PaymentMethod;
};

export type CreatePaymentInput = {
  bookingId: string;
  amount: number;
  method?: PaymentMethod;
  externalReference?: string | null;
  paymentUrl?: string | null;
  snapToken?: string | null;
  expiredAt?: Date | null;
};

export type UpdatePaymentInput = {
  id: string;
  status?: PaymentStatus;
  externalReference?: string | null;
  paymentUrl?: string | null;
  snapToken?: string | null;
  paidAt?: Date | null;
  expiredAt?: Date | null;
  customerConfirmedAt?: Date | null;
  approvedByUserId?: string | null;
  approvedAt?: Date | null;
  rejectedByUserId?: string | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
};

export type OwnerPaymentInstructions = {
  venueName: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  qrisImageUrl: string | null;
};

export type AwaitingConfirmationPaymentItem = {
  paymentId: string;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  courtName: string;
  bookingDate: string;
  startMinute: number;
  endMinute: number;
  durationMinute: number;
  amount: number;
  customerConfirmedAt: string | null;
  showReminder: boolean;
};

export type ManualPaymentDetailData = {
  paymentId: string;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  customerNote: string | null;
  venueName: string;
  courtName: string;
  bookingDate: string;
  startMinute: number;
  endMinute: number;
  durationMinute: number;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  customerConfirmedAt: string | null;
  rejectionReason: string | null;
  ownerPaymentInstructions: OwnerPaymentInstructions;
  showReminder: boolean;
  auditLogs: {
    id: string;
    action: string;
    actorUserId: string | null;
    fromStatus: PaymentStatus | null;
    toStatus: PaymentStatus | null;
    note: string | null;
    createdAt: string;
  }[];
};

export type FindPaymentsByBookingIdInput = {
  bookingId: string;
};

export type MarkPaymentAsPaidInput = {
  id: string;
  externalReference: string;
  paidAt?: Date;
};

export type MarkPaymentStatusInput = {
  id: string;
};

export type PublicCheckoutData = {
  bookingId: string;
  bookingNumber: string;
  bookingDate: string;
  startMinute: number;
  endMinute: number;
  durationMinute: number;
  totalPrice: number;
  pricePerHourSnapshot: number;
  status: BookingStatus;
  expiresAt: string;
  customerName: string;
  customerPhone: string;
  venueName: string;
  venueSlug: string;
  courtName: string;
  hasPaidPayment: boolean;
  hasPendingPayment: boolean;
  invoiceId: string | null;
  invoiceNumber: string | null;
  latestPaymentStatus: PaymentStatus | null;
  customerPaymentStatus: string;
  customerConfirmedAt: string | null;
  rejectionReason: string | null;
  ownerPaymentInstructions: OwnerPaymentInstructions;
  paymentSummary: PublicPaymentSummary | null;
};

export type CreatePaymentRequest = {
  bookingId: string;
  finishRedirectUrl?: string;
};

export type CreatePaymentResult = {
  paymentUrl: string;
  token: string;
  transactionId: string;
};

export type MidtransCallbackPayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_time?: string;
};

export type RevenueDashboardInput = {
  ownerId: string;
  preset: RevenueDateRangePreset;
  customFrom?: Date;
  customTo?: Date;
};

export type RevenueDashboardSummary = {
  todayRevenue: number;
  monthRevenue: number;
  completedPayments: number;
  pendingPayments: number;
};

export type RevenueByDayPoint = {
  date: string;
  revenue: number;
};

export type RecentPaymentItem = {
  id: string;
  bookingNumber: string;
  customerName: string;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
};

export type RevenueDashboardData = {
  summary: RevenueDashboardSummary;
  chart: RevenueByDayPoint[];
  recentPayments: RecentPaymentItem[];
  dateRange: {
    preset: RevenueDateRangePreset;
    from: string;
    to: string;
  };
};

export type RevenueDashboardQueryInput = {
  ownerId: string;
  todayStart: Date;
  todayEnd: Date;
  monthStart: Date;
  monthEnd: Date;
  rangeFrom: Date;
  rangeTo: Date;
  recentLimit: number;
};

export type RevenueSnapshotRecord = {
  todayRevenue: number;
  monthRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  paidInMonth: {
    paidAt: Date;
    amount: number;
  }[];
  recentPayments: {
    id: string;
    amount: number;
    status: PaymentStatus;
    paidAt: Date | null;
    booking: {
      bookingNumber: string;
      contact: {
        customerName: string;
      } | null;
    };
  }[];
};
