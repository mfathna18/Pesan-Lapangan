"use client";

import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PublicVenueListItem } from "@/domains/venue/types";
import { cn } from "@/lib/utils";

type VenueDiscoverySectionProps = {
  venues: PublicVenueListItem[];
};

export function VenueDiscoverySection({ venues }: VenueDiscoverySectionProps) {
  const [query, setQuery] = useState("");

  const filteredVenues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return venues;
    }

    return venues.filter((venue) =>
      venue.name.toLowerCase().includes(normalizedQuery),
    );
  }, [query, venues]);

  return (
    <section
      id="cari-lapangan"
      className="border-border bg-muted/30 scroll-mt-20 border-y px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <p className="text-primary text-sm font-medium tracking-widest uppercase">
            Temukan Venue
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Cari Lapangan Olahraga
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Pilih venue olahraga aktif dan lanjutkan booking lapangan favoritmu.
          </p>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="bg-card ring-foreground/10 flex flex-col gap-3 rounded-2xl p-3 shadow-sm ring-1 sm:flex-row sm:items-center sm:p-2">
            <Input
              type="search"
              placeholder="Cari nama gor..."
              aria-label="Cari nama gor"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button type="button" size="lg" className="h-11 w-full sm:w-auto">
              <Search />
              Cari Lapangan
            </Button>
          </div>
        </div>

        {venues.length === 0 ? (
          <Card className="mx-auto w-full max-w-lg">
            <CardHeader className="text-center">
              <CardTitle>Belum Ada Venue Tersedia</CardTitle>
              <CardDescription>
                Saat ini belum ada gor aktif yang bisa dipesan. Coba kembali
                lagi nanti atau daftarkan gor kamu di PesanLapangan.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : filteredVenues.length === 0 ? (
          <Card className="mx-auto w-full max-w-lg">
            <CardHeader className="text-center">
              <CardTitle>Venue Tidak Ditemukan</CardTitle>
              <CardDescription>
                Tidak ada gor dengan nama &ldquo;{query.trim()}&rdquo;. Coba
                kata kunci lain.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuery("")}
              >
                Tampilkan Semua Venue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue) => (
              <Card key={venue.id} className="flex flex-col overflow-hidden">
                <div className="bg-muted flex aspect-[16/9] w-full items-center justify-center overflow-hidden">
                  {venue.coverImageUrl ? (
                    <div
                      className="size-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${venue.coverImageUrl})` }}
                      role="img"
                      aria-label={venue.name}
                    />
                  ) : (
                    <span className="text-muted-foreground px-4 text-center text-sm">
                      {venue.name}
                    </span>
                  )}
                </div>
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg">{venue.name}</CardTitle>
                  <CardDescription className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    <span>
                      {venue.city}
                      {venue.address ? ` · ${venue.address}` : ""}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  {venue.description ? (
                    <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                      {venue.description}
                    </p>
                  ) : null}
                  <Link
                    href={`/gor/${venue.slug}`}
                    className={cn(buttonVariants(), "w-full")}
                  >
                    Lihat Venue
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
