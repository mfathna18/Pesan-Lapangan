import type {
  BookingStatus,
  PaymentStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/generated/prisma/client";

export type AdminDashboardKpis = {
  totalOwners: number;
  totalVenues: number;
  totalCourts: number;
  totalBookings: number;
  todayBookings: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
};

export type AdminRecentBooking = {
  id: string;
  bookingNumber: string;
  customerName: string;
  gorName: string;
  courtName: string;
  bookingDate: string;
  status: BookingStatus;
  createdAt: string;
};

export type AdminRecentRegistration = {
  id: string;
  ownerName: string;
  email: string;
  gorName: string | null;
  createdAt: string;
};

export type AdminRecentSubscription = {
  id: string;
  ownerName: string;
  email: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  createdAt: string;
};

export type AdminRecentPayment = {
  id: string;
  type: "subscription" | "booking";
  ownerOrCustomer: string;
  amount: number;
  status: PaymentStatus;
  reference: string;
  createdAt: string;
};

export type AdminTrendPoint = {
  label: string;
  value: number;
};

export type AdminSportPopularity = {
  sport: string;
  count: number;
};

export type AdminDashboardData = {
  kpis: AdminDashboardKpis;
  recentBookings: AdminRecentBooking[];
  recentRegistrations: AdminRecentRegistration[];
  recentSubscriptions: AdminRecentSubscription[];
  recentPayments: AdminRecentPayment[];
  newOwnersLast30Days: number;
  revenueTrend: AdminTrendPoint[];
  bookingsTrend: AdminTrendPoint[];
  popularSports: AdminSportPopularity[];
};

export type AdminOwnerRow = {
  id: string;
  ownerName: string;
  email: string;
  gorName: string | null;
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus | null;
  createdAt: string;
};

export type AdminOwnersListResult = {
  items: AdminOwnerRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminOwnersListInput = {
  search?: string;
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  page?: number;
  pageSize?: number;
};

export type AdminVenueRow = {
  id: string;
  venueName: string;
  ownerName: string;
  city: string;
  courtCount: number;
  isActive: boolean;
  updatedAt: string;
};

export type AdminSubscriptionRow = {
  id: string;
  ownerName: string;
  email: string;
  plan: SubscriptionPlan;
  startsAt: string;
  expiresAt: string | null;
  status: SubscriptionStatus;
  remainingDays: number | null;
};

export type AdminSubscriptionPaymentRow = {
  id: string;
  ownerName: string;
  amount: number;
  status: PaymentStatus;
  targetPlan: SubscriptionPlan;
  billingAction: string;
  paidAt: string | null;
  createdAt: string;
};

export type AdminBookingPaymentRow = {
  id: string;
  bookingNumber: string;
  customerName: string;
  gorName: string;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
};

export type AdminSystemStatus = {
  database: "healthy" | "unhealthy";
  storage: "configured" | "not_configured";
  version: string;
  environment: string;
  deploymentTime: string | null;
  deploymentRef: string | null;
};
