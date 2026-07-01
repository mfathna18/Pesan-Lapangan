import type { BookingStatus } from "@/generated/prisma/client";

export type CreateBookingContactInput = {
  customerName: string;
  customerPhone: string;
  note?: string | null;
};

export type CreateBookingInput = {
  courtId: string;
  bookingNumber: string;
  bookingDate: Date;
  startMinute: number;
  endMinute: number;
  durationMinute: number;
  totalPrice: number;
  status?: BookingStatus;
  gorNameSnapshot: string;
  courtNameSnapshot: string;
  sportTypeSnapshot: string;
  pricePerHourSnapshot: number;
  contact: CreateBookingContactInput;
};

export type UpdateBookingStatusInput = {
  id: string;
  status: BookingStatus;
};

export type DeleteBookingInput = {
  id: string;
};

export type FindBookingByCourtAndDateInput = {
  courtId: string;
  date: Date;
};

export type ListBookingsInput = {
  ownerId: string;
  page: number;
  pageSize: number;
  sort: "newest" | "oldest";
  courtId?: string;
  status?: BookingStatus;
  bookingDate?: Date;
  bookingNumberSearch?: string;
};

export type ListBookingsResult = {
  items: BookingListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type BookingListItem = {
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

export type BookingPaymentDisplayStatus =
  "NONE" | "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";

export type BookingDetail = {
  id: string;
  bookingNumber: string;
  bookingDate: string;
  startMinute: number;
  endMinute: number;
  durationMinute: number;
  totalPrice: number;
  status: BookingStatus;
  gorNameSnapshot: string;
  courtNameSnapshot: string;
  sportTypeSnapshot: string;
  pricePerHourSnapshot: number;
  createdAt: string;
  updatedAt: string;
  contact: {
    customerName: string;
    customerPhone: string;
    note: string | null;
  } | null;
  payment: BookingDetailPayment | null;
  invoice: BookingDetailInvoice | null;
};

export type BookingDetailPayment = {
  id: string;
  amount: number;
  status: string;
  method: string;
  externalReference: string | null;
  paidAt: string | null;
  expiredAt: string | null;
  createdAt: string;
};

export type BookingDetailInvoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmountSnapshot: number;
  generatedAt: string;
};

export type BookingFilterOptions = {
  courts: {
    id: string;
    name: string;
    sportType: string;
  }[];
};

export type AnalyticsDashboardQueryInput = {
  ownerId: string;
  periodStart: Date;
  periodEnd: Date;
};

export type AnalyticsBookingRecord = {
  id: string;
  courtId: string;
  courtNameSnapshot: string;
  status: BookingStatus;
  bookingDate: Date;
  startMinute: number;
  durationMinute: number;
  payments: {
    amount: number;
  }[];
};

export type AnalyticsCourtRecord = {
  id: string;
  name: string;
};

export type AnalyticsOperatingHoursRecord = {
  courtId: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
};

export type AnalyticsSnapshotRecord = {
  bookings: AnalyticsBookingRecord[];
  courts: AnalyticsCourtRecord[];
  operatingHours: AnalyticsOperatingHoursRecord[];
};

export type AnalyticsCountPoint = {
  label: string;
  count: number;
};

export type AnalyticsUtilizationPoint = {
  courtId: string;
  courtName: string;
  occupancyPercent: number;
};

export type AnalyticsTopCourtRow = {
  courtId: string;
  courtName: string;
  totalBookings: number;
  revenue: number;
  occupancyPercent: number;
};

export type AnalyticsDashboardData = {
  cards: {
    mostBookedCourt: string;
    peakBookingHour: string;
    peakBookingDay: string;
    bookingSuccessRate: number;
    cancellationRate: number;
    courtUtilization: number;
  };
  charts: {
    bookingsByDay: AnalyticsCountPoint[];
    bookingsByHour: AnalyticsCountPoint[];
    courtUtilization: AnalyticsUtilizationPoint[];
  };
  topCourts: AnalyticsTopCourtRow[];
  period: {
    from: string;
    to: string;
  };
};

export type PublicCourtOpenHours = {
  dayOfWeek: number;
  dayLabel: string;
  hours: string;
};

import type { CourtFacility } from "@/generated/prisma/client";

export type PublicCourtDetailRecord = {
  id: string;
  name: string;
  sportType: string;
  description: string | null;
  imageUrls: string[];
  facilities: CourtFacility[];
  gor: {
    id: string;
    name: string;
    slug: string;
  };
};

export type PublicCourtDetailData = {
  id: string;
  name: string;
  sportType: string;
  sportLabel: string;
  description: string | null;
  imageUrls: string[];
  facilities: {
    type: string;
    label: string;
  }[];
  startingPrice: number | null;
  openHours: PublicCourtOpenHours[];
  gor: {
    id: string;
    name: string;
    slug: string;
  };
};

export type OwnerCourtListItem = {
  id: string;
  name: string;
  sportType: string;
  sportLabel: string;
  isActive: boolean;
  displayOrder: number;
};

export type CreateOwnerCourtInput = {
  name: string;
  sportType: string;
  isActive: boolean;
};

export type UpdateOwnerCourtInput = {
  name: string;
  sportType: string;
  isActive: boolean;
};

export type OwnerPriceRuleListItem = {
  id: string;
  courtId: string;
  dayOfWeek: number;
  dayLabel: string;
  startTime: string;
  endTime: string;
  price: number;
  priceLabel: string;
  isActive: boolean;
};

export type SaveOwnerPriceRuleInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  price: number;
  isActive: boolean;
};

export type CreateOwnerPriceRuleInput = SaveOwnerPriceRuleInput & {
  courtId: string;
};

export type UpdateOwnerPriceRuleInput = SaveOwnerPriceRuleInput & {
  courtId: string;
  priceRuleId: string;
};
