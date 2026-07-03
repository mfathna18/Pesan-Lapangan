import { ImageIcon } from "lucide-react";

import { customerLayout } from "@/lib/customer-layout";

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
  if (imageUrls.length === 0) {
    return (
      <section className="px-4 pt-6 sm:px-6">
        <div className={customerLayout.containerWide}>
          <div className="bg-muted/50 border-border flex aspect-[16/9] w-full flex-col items-center justify-center gap-4 rounded-[var(--radius-card-lg)] border border-dashed lg:aspect-[21/9]">
            <ImageIcon className="text-muted-foreground size-12" aria-hidden />
            <div className="space-y-1 text-center">
              <p className="text-base font-medium">
                Foto lapangan segera hadir
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

  const [heroImage, ...galleryImages] = imageUrls;

  return (
    <section className="px-4 pt-6 sm:px-6">
      <div className={customerLayout.containerWide}>
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={courtName}
            className="border-border aspect-[16/9] w-full rounded-[var(--radius-card-lg)] border object-cover lg:aspect-[21/9]"
          />

          {galleryImages.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {galleryImages.map((url, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${url}-${index}`}
                  src={url}
                  alt={`${courtName} ${index + 2}`}
                  className="border-border aspect-[4/3] w-full rounded-[var(--radius-card)] border object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
