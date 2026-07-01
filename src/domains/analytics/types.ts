import type { BookingPaymentDisplayStatus } from "@/domains/booking/types";
import type { BookingStatus, PaymentStatus } from "@/generated/prisma/client";

export type OwnerAnalyticsCountPoint = {
  label: string;
  count: number;
};

export type OwnerAnalyticsTopCourtRow = {
  courtId: string;
  courtName: string;
  totalBookings: number;
};

export type OwnerAnalyticsSportDistributionRow = {
  sportType: string;
  label: string;
  count: number;
};

export type OwnerAnalyticsRecentBookingRow = {
  id: string;
  bookingNumber: string;
  customerName: string;
  courtName: string;
  bookingDate: string;
  startMinute: number;
  endMinute: number;
  bookingStatus: BookingStatus;
  paymentStatus: BookingPaymentDisplayStatus;
  createdAt: string;
};

export type OwnerOperationalDashboardData = {
  hasBookings: boolean;
  kpis: {
    bookingsToday: number;
    bookingsThisMonth: number;
    revenueThisMonth: number;
    activeCourts: number;
    pendingPayments: number;
  };
  recentBookings: OwnerAnalyticsRecentBookingRow[];
};

export type OwnerAnalyticsDashboardData = {
  hasBookings: boolean;
  kpis: {
    bookingsToday: number;
    bookingsThisWeek: number;
    bookingsThisMonth: number;
    revenueThisMonth: number;
  };
  topCourts: OwnerAnalyticsTopCourtRow[];
  topHours: OwnerAnalyticsCountPoint[];
  sportDistribution: OwnerAnalyticsSportDistributionRow[];
  recentBookings: OwnerAnalyticsRecentBookingRow[];
  period: {
    from: string;
    to: string;
  };
};

export type OwnerAnalyticsSnapshotQuery = {
  ownerId: string;
  queryStart: Date;
  queryEnd: Date;
  monthStart: Date;
  monthEnd: Date;
  recentBookingsLimit: number;
};

export type OwnerAnalyticsPeriodBookingRecord = {
  id: string;
  courtId: string;
  courtNameSnapshot: string;
  sportTypeSnapshot: string;
  status: BookingStatus;
  bookingDate: Date;
  startMinute: number;
};

export type OwnerAnalyticsRecentBookingRecord = {
  id: string;
  bookingNumber: string;
  courtNameSnapshot: string;
  bookingDate: Date;
  startMinute: number;
  endMinute: number;
  status: BookingStatus;
  createdAt: Date;
  contact: {
    customerName: string;
  } | null;
  payments: {
    status: PaymentStatus;
  }[];
};

export type OwnerAnalyticsSnapshotRecord = {
  totalBookingCount: number;
  periodBookings: OwnerAnalyticsPeriodBookingRecord[];
  recentBookings: OwnerAnalyticsRecentBookingRecord[];
  monthRevenue: number;
  activeCourts: number;
  pendingPayments: number;
};
