import { BookingManagement } from "@/components/booking/booking-management";
import { createPageMetadata } from "@/config/page-metadata";

export const metadata = createPageMetadata(
  "Booking",
  "Kelola dan pantau semua booking di venue Anda.",
);

export default function DashboardBookingsPage() {
  return <BookingManagement />;
}
