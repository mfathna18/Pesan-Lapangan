import { CalendarCheck, FileText, ShieldCheck, Smartphone } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { landingContent } from "@/config/landing";
import { layout } from "@/lib/design-system";

const benefitIcons = [
  CalendarCheck,
  ShieldCheck,
  FileText,
  Smartphone,
] as const;

export function WhyChooseUsSection() {
  const { whyChooseUs } = landingContent;

  return (
    <section
      id="keunggulan"
      className={`${layout.section} bg-muted/40 scroll-mt-20`}
    >
      <div className={`${layout.container} flex flex-col gap-12`}>
        <SectionHeader
          title={whyChooseUs.title}
          description={whyChooseUs.description}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          {whyChooseUs.benefits.map((benefit, index) => {
            const Icon = benefitIcons[index] ?? CalendarCheck;

            return (
              <Card key={benefit.title} className="h-full">
                <CardHeader>
                  <div className="bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-[var(--radius-button)]">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
