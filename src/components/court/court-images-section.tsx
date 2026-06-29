import { ImageIcon } from "lucide-react";

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
      <section className="px-4 pb-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="bg-muted/50 border-border flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed sm:aspect-[21/9]">
            <ImageIcon className="text-muted-foreground size-10" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium">Foto lapangan segera hadir</p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {courtName} · {sportLabel}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 pb-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {imageUrls.map((url, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${url}-${index}`}
              src={url}
              alt={`${courtName} ${index + 1}`}
              className={`border-border w-full rounded-2xl border object-cover ${
                index === 0
                  ? "aspect-[16/9] sm:col-span-2 lg:col-span-2 lg:aspect-[21/9]"
                  : "aspect-[4/3]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
