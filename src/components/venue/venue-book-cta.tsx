import { Button } from "@/components/ui/button";
import type { PublicVenueData } from "@/domains/venue/types";

type VenueBookCtaProps = {
  venue: PublicVenueData;
};

export function VenueBookCta({ venue }: VenueBookCtaProps) {
  return (
    <section id="pesan-sekarang" className="px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="bg-primary text-primary-foreground rounded-3xl px-6 py-10 text-center sm:px-10">
          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Siap Booking di {venue.name}?
            </h2>
            <p className="text-primary-foreground/85 text-sm sm:text-base">
              Fitur pemesanan online akan segera hadir. Simpan halaman venue ini
              untuk memulai booking nanti.
            </p>
            <Button type="button" size="lg" variant="secondary">
              Pesan Sekarang
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
