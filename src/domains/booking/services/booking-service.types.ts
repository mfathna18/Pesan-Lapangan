import type { CreateBookingContactInput } from "@/domains/booking/types";

export type CreateBookingRequest = {
  courtId: string;
  bookingDate: Date;
  startMinute: number;
  endMinute: number;
  contact: CreateBookingContactInput;
};
