import Link from "next/link";

import { CourtDetailHeader } from "@/components/court/court-detail-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PublicInvoiceUnavailableProps = {
  venueSlug: string;
  venueName: string;
  bookingId: string;
};

export function PublicInvoiceUnavailable({
  venueSlug,
  venueName,
  bookingId,
}: PublicInvoiceUnavailableProps) {
  const successHref = `/gor/${venueSlug}/checkout/${bookingId}/success`;
  const checkoutHref = `/gor/${venueSlug}/checkout/${bookingId}`;

  return (
    <div className="bg-background min-h-screen">
      <CourtDetailHeader gorSlug={venueSlug} gorName={venueName} />
      <main className="px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Invoice Belum Tersedia</CardTitle>
              <CardDescription className="text-base">
                Invoice untuk booking ini belum dibuat atau masih diproses.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-muted-foreground max-w-md text-center text-sm">
                Jika kamu baru menyelesaikan pembayaran, tunggu beberapa saat
                lalu muat ulang halaman ini. Invoice akan muncul setelah
                pembayaran dikonfirmasi.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={successHref}
                  className={cn(buttonVariants(), "flex-1")}
                >
                  Lihat Status Booking
                </Link>
                <Link
                  href={checkoutHref}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "flex-1",
                  )}
                >
                  Kembali ke Pembayaran
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
