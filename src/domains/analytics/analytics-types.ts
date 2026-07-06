import type { BookingPaymentDisplayStatus } from "@/domains/booking/types";
import type { BookingStatus, PaymentStatus } from "@/generated/prisma/client";

export const ANALYTICS_LIMITS = {
  TOP_COURTS: 10,
  TOP_HOURS: 8,
  RECENT_BOOKINGS: 10,
  ACTIVITY_EVENTS: 20,
  TREND_DAYS: 7,
} as const;

export type OccupancyStatus = "excellent" | "good" | "needs_attention";

export type KpiComparison = {
  current: number;
  previous: number;
  changePercent: number | null;
  periodLabel: string;
};

export type BiKpiCard = {
  id: string;
  title: string;
  value: string;
  comparison: KpiComparison;
  trend: "up" | "down" | "flat";
  calculation: string;
  accent?: "green" | "default";
};

export type BiOccupancyKpi = BiKpiCard & {
  percent: number;
  status: OccupancyStatus;
  statusLabel: string;
};

export type BiInsightCard = {
  id: string;
  title: string;
  value: string;
  description: string;
  variant: "default" | "success" | "warning" | "muted";
};

export type BiRecommendation = {
  id: string;
  message: string;
  priority: "high" | "medium" | "low";
  ruleId: string;
};

export type BiTrendPoint = {
  label: string;
  value: number;
};

export type BiTrendSeries = {
  id: string;
  title: string;
  points: BiTrendPoint[];
  calculation: string;
};

export type BiActivityType =
  | "booking_created"
  | "payment_received"
  | "invoice_generated"
  | "booking_cancelled";

export type BiActivityEvent = {
  id: string;
  type: BiActivityType;
  title: string;
  description: string;
  timestamp: string;
};

export type BiQuickAction = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type BusinessIntelligenceDashboardData = {
  hasData: boolean;
  period: {
    from: string;
    to: string;
    comparisonFrom: string;
    comparisonTo: string;
  };
  kpis: {
    revenue: BiKpiCard;
    bookings: BiKpiCard;
    activeCustomers: BiKpiCard;
    occupancy: BiOccupancyKpi;
  };
  insights: BiInsightCard[];
  recommendations: BiRecommendation[];
  trends: BiTrendSeries[];
  activity: BiActivityEvent[];
  quickActions: BiQuickAction[];
};

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

export type BiSnapshotQuery = {
  ownerId: string;
  currentMonthStart: Date;
  currentMonthEnd: Date;
  previousMonthStart: Date;
  previousMonthEnd: Date;
  trendStart: Date;
  trendEnd: Date;
  weekStart: Date;
  weekEnd: Date;
  queryStart: Date;
  queryEnd: Date;
  recentBookingsLimit: number;
  activityLimit: number;
};

export type BiBookingRecord = {
  id: string;
  courtId: string;
  courtNameSnapshot: string;
  sportTypeSnapshot: string;
  status: BookingStatus;
  bookingDate: Date;
  startMinute: number;
  endMinute: number;
  durationMinute: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  contact: {
    customerPhone: string;
    customerName: string;
  } | null;
  payments: {
    status: PaymentStatus;
    amount: number;
    paidAt: Date | null;
  }[];
};

export type BiCourtRecord = {
  id: string;
  name: string;
};

export type BiOperatingHoursRecord = {
  courtId: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
};

export type BiActivityBookingRecord = {
  id: string;
  bookingNumber: string;
  courtNameSnapshot: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  contact: { customerName: string } | null;
};

export type BiActivityPaymentRecord = {
  id: string;
  amount: number;
  paidAt: Date | null;
  booking: {
    bookingNumber: string;
    courtNameSnapshot: string;
    contact: { customerName: string } | null;
  };
};

export type BiActivityInvoiceRecord = {
  id: string;
  invoiceNumber: string;
  customerNameSnapshot: string;
  courtNameSnapshot: string;
  generatedAt: Date;
};

export type BiTrendPaymentRecord = {
  amount: number;
  paidAt: Date | null;
};

export type BiTrendBookingRecord = {
  bookingDate: Date;
  status: BookingStatus;
};

export type BiKpiBookingRecord = {
  courtId: string;
  status: BookingStatus;
  bookingDate: Date;
  startMinute: number;
  durationMinute: number;
  contact: {
    customerPhone: string;
    customerName: string;
  } | null;
};

export type BiKpiSnapshot = {
  periodBookings: BiKpiBookingRecord[];
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  courts: BiCourtRecord[];
  operatingHours: BiOperatingHoursRecord[];
};

export type BiKpiSnapshotQuery = {
  ownerId: string;
  previousMonthStart: Date;
  previousMonthEnd: Date;
  currentMonthStart: Date;
  currentMonthEnd: Date;
};

export type BiBusinessIntelligenceSnapshot = {
  totalBookingCount: number;
  periodBookings: BiBookingRecord[];
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  courts: BiCourtRecord[];
  operatingHours: BiOperatingHoursRecord[];
  pendingPayments: number;
  pendingBookings: number;
  activityBookings: BiActivityBookingRecord[];
  activityPayments: BiActivityPaymentRecord[];
  activityInvoices: BiActivityInvoiceRecord[];
  trendPayments: BiTrendPaymentRecord[];
  trendBookings: BiTrendBookingRecord[];
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

export type RecommendationContext = {
  occupancyPercent: number;
  saturdayOccupancyPercent: number;
  lowestCourtUtilization: number;
  lowestCourtName: string;
  pendingBookings: number;
  pendingPayments: number;
  revenueChangePercent: number | null;
  revenueIncreased: boolean;
};
