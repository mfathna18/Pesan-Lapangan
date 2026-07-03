import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CUSTOMER_COPY } from "@/config/customer-copy";
import { customerLayout } from "@/lib/customer-layout";
import { formatCurrency } from "@/domains/booking/utils/booking-display";

type CourtPriceSectionProps = {
  startingPrice: number;
};

export function CourtPriceSection({ startingPrice }: CourtPriceSectionProps) {
  return (
    <section className="px-4 sm:px-6">
      <div className={customerLayout.containerWide}>
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">
              {CUSTOMER_COPY.court.priceTitle}
            </CardTitle>
            <CardDescription>
              {CUSTOMER_COPY.court.priceDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {formatCurrency(startingPrice)}
              <span className="text-muted-foreground ml-2 text-base font-normal">
                {CUSTOMER_COPY.court.pricePerHour}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
