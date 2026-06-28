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
