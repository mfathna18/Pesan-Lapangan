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
import { getPublicCheckoutService } from "@/domains/payment/actions/get-public-checkout-service";
import { PublicCheckoutNotFoundError } from "@/domains/payment/errors";
import {
  formatBookingDate,
  formatCurrency,
  formatMinuteOfDay,
} from "@/domains/booking/utils/booking-display";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

type WaitingPaymentPageProps = {
  params: Promise<{
    slug: string;
    bookingId: string;
  }>;
};

export default async function WaitingPaymentPage({
  params,
}: WaitingPaymentPageProps) {
  const { slug, bookingId } = await params;

  let checkout;

  try {
    checkout = await getPublicCheckoutService().getCheckoutData(
      slug,
      bookingId,
    );
  } catch (error) {
    if (error instanceof PublicCheckoutNotFoundError) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="bg-background min-h-screen">
      <CourtDetailHeader
        gorSlug={checkout.venueSlug}
        gorName={checkout.venueName}
      />
      <main className="px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
              Menunggu Pembayaran
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Pembayaran Sedang Diproses
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Kami menunggu konfirmasi dari Midtrans. Status booking akan
              diperbarui setelah pembayaran berhasil.
            </p>
          </div>

          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{checkout.bookingNumber}</CardTitle>
                <Badge variant={checkout.hasPaidPayment ? "paid" : "pending"}>
                  {checkout.hasPaidPayment ? "Paid" : "Pending"}
                </Badge>
              </div>
              <CardDescription>
                Simpan nomor booking ini sambil menunggu konfirmasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">Venue</p>
                <p className="font-medium">{checkout.venueName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Lapangan</p>
                <p className="font-medium">{checkout.courtName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Tanggal</p>
                <p className="font-medium">
                  {formatBookingDate(checkout.bookingDate)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Waktu</p>
                <p className="font-medium">
                  {formatMinuteOfDay(checkout.startMinute)} -{" "}
                  {formatMinuteOfDay(checkout.endMinute)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-sm">Total</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(checkout.totalPrice)}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!checkout.hasPaidPayment ? (
              <Link
                href={`/gor/${checkout.venueSlug}/checkout/${checkout.bookingId}`}
                className={cn(buttonVariants(), "flex-1")}
              >
                Coba Bayar Lagi
              </Link>
            ) : null}
            <Link
              href={`/gor/${checkout.venueSlug}`}
              className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
            >
              Kembali ke Venue
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
