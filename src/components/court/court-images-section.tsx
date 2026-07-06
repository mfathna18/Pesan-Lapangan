import Image from "next/image";
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

  const heroImage = imageUrls[0]!;
  const galleryImages = imageUrls.slice(1);

  return (
    <section className="px-4 pt-6 sm:px-6">
      <div className={customerLayout.containerWide}>
        <div className="space-y-3">
          <div className="border-border relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-card-lg)] border lg:aspect-[21/9]">
            <Image
              src={heroImage}
              alt={courtName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1152px"
              className="object-cover"
            />
          </div>

          {galleryImages.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {galleryImages.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="border-border relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] border"
                >
                  <Image
                    src={url}
                    alt={`${courtName} ${index + 2}`}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
