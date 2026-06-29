import type { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";

import type { RevenueDateRangePreset } from "@/domains/payment/constants";

export type CreatePaymentInput = {
  bookingId: string;
  amount: number;
  method?: PaymentMethod;
  externalReference?: string | null;
  expiredAt?: Date | null;
};

export type UpdatePaymentInput = {
  id: string;
  status?: PaymentStatus;
  externalReference?: string | null;
  paidAt?: Date | null;
  expiredAt?: Date | null;
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

export type CreatePaymentRequest = {
  bookingId: string;
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
