import Link from "next/link";

import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createBookingRepository } from "@/domains/booking/repositories/booking-repository";
import {
  formatBookingDate,
  formatCurrency,
  formatMinuteOfDay,
} from "@/domains/booking/utils/booking-display";
import { getCourtService } from "@/domains/booking/actions/get-court-service";
import { CourtNotFoundError } from "@/domains/booking/errors";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";

type BookingCheckoutPageProps = {
  params: Promise<{
    slug: string;
    courtId: string;
  }>;
  searchParams: Promise<{
    bookingId?: string;
  }>;
};

export default async function BookingCheckoutPage({
  params,
  searchParams,
}: BookingCheckoutPageProps) {
  const { slug, courtId } = await params;
  const { bookingId } = await searchParams;

  if (!bookingId) {
    notFound();
  }

  let court;

  try {
    court = await getCourtService().getPublicCourtDetail(slug, courtId);
  } catch (error) {
    if (error instanceof CourtNotFoundError) {
      notFound();
    }

    throw error;
  }

  const booking = await createBookingRepository(prisma).findById(bookingId);

  if (!booking || booking.courtId !== courtId) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      <CourtDetailHeader gorSlug={court.gor.slug} gorName={court.gor.name} />
      <main className="px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
              Checkout
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Booking Berhasil Dibuat
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Booking kamu tersimpan dengan status menunggu pembayaran.
            </p>
          </div>

          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{booking.bookingNumber}</CardTitle>
                <Badge variant="pending">Pending</Badge>
              </div>
              <CardDescription>
                Simpan nomor booking ini untuk referensi selanjutnya.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">Venue</p>
                <p className="font-medium">{court.gor.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Lapangan</p>
                <p className="font-medium">{booking.courtNameSnapshot}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Tanggal</p>
                <p className="font-medium">
                  {formatBookingDate(booking.bookingDate)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Waktu</p>
                <p className="font-medium">
                  {formatMinuteOfDay(booking.startMinute)} -{" "}
                  {formatMinuteOfDay(booking.endMinute)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Durasi</p>
                <p className="font-medium">{booking.durationMinute} menit</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total</p>
                <p className="font-medium">
                  {formatCurrency(booking.totalPrice)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Nama</p>
                <p className="font-medium">
                  {booking.contact?.customerName ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Telepon</p>
                <p className="font-medium">
                  {booking.contact?.customerPhone ?? "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/gor/${court.gor.slug}`}
              className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
            >
              Kembali ke Venue
            </Link>
            <Link href="/" className={cn(buttonVariants(), "flex-1")}>
              Ke Beranda
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
