"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { customerLayout } from "@/lib/customer-layout";
import { cn } from "@/lib/utils";

type CourtImagesSectionProps = {
  courtName: string;
  sportLabel: string;
  imageUrls: string[];
};

export function CourtImagesSection({
  courtName,
  sportLabel,
  imageUrls,
}: CourtImagesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [imageUrls]);

  if (imageUrls.length === 0) {
    return (
      <section className="px-4 pt-6 sm:px-6">
        <div className={customerLayout.containerWide}>
          <div className="bg-muted/50 border-border flex aspect-[16/9] w-full flex-col items-center justify-center gap-4 rounded-[var(--radius-card-lg)] border border-dashed lg:aspect-[21/9]">
            <ImageIcon className="text-muted-foreground size-12" aria-hidden />
            <div className="space-y-1 px-6 text-center">
              <p className="text-base font-medium">
                Pemilik venue belum menambahkan foto lapangan.
              </p>
              <p className="text-muted-foreground text-sm">
                {courtName} · {sportLabel}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const safeIndex = Math.min(activeIndex, imageUrls.length - 1);
  const activeImage = imageUrls[safeIndex]!;

  function goTo(index: number) {
    setActiveIndex((index + imageUrls.length) % imageUrls.length);
  }

  return (
    <section className="px-4 pt-6 sm:px-6">
      <div className={customerLayout.containerWide}>
        <div className="space-y-3">
          <div
            className="border-border relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-card-lg)] border lg:aspect-[21/9]"
            onTouchStart={(event) => {
              setTouchStartX(event.changedTouches[0]?.clientX ?? null);
            }}
            onTouchEnd={(event) => {
              if (touchStartX == null || imageUrls.length < 2) {
                return;
              }

              const endX = event.changedTouches[0]?.clientX;
              if (endX == null) {
                return;
              }

              const delta = endX - touchStartX;
              if (Math.abs(delta) < 40) {
                return;
              }

              goTo(delta < 0 ? safeIndex + 1 : safeIndex - 1);
              setTouchStartX(null);
            }}
          >
            <Image
              src={activeImage}
              alt={`${courtName} ${safeIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1152px"
              className="object-cover"
            />

            {imageUrls.length > 1 ? (
              <>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="secondary"
                  className="absolute top-1/2 left-3 -translate-y-1/2"
                  onClick={() => goTo(safeIndex - 1)}
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="secondary"
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                  onClick={() => goTo(safeIndex + 1)}
                  aria-label="Foto berikutnya"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </>
            ) : null}
          </div>

          {imageUrls.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imageUrls.map((url, index) => (
                <button
                  key={`${url}-thumb-${index}`}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    "border-border relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-[var(--radius-card)] border transition-[box-shadow,opacity]",
                    index === safeIndex
                      ? "ring-primary opacity-100 ring-2"
                      : "opacity-70 hover:opacity-100",
                  )}
                  aria-label={`Lihat foto ${index + 1}`}
                  aria-current={index === safeIndex}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
