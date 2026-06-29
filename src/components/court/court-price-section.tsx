import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/domains/booking/utils/booking-display";

type CourtPriceSectionProps = {
  startingPrice: number;
};

export function CourtPriceSection({ startingPrice }: CourtPriceSectionProps) {
  return (
    <section className="px-4 pb-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Harga Mulai</CardTitle>
            <CardDescription>
              Tarif terendah dari aturan harga aktif lapangan ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {formatCurrency(startingPrice)}
              <span className="text-muted-foreground ml-2 text-base font-normal">
                / jam
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
