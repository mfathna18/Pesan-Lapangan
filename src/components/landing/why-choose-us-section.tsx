import { CalendarCheck, FileText, ShieldCheck, Smartphone } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { landingContent } from "@/config/landing";

const benefitIcons = [
  CalendarCheck,
  ShieldCheck,
  FileText,
  Smartphone,
] as const;

export function WhyChooseUsSection() {
  const { whyChooseUs } = landingContent;

  return (
    <section id="keunggulan" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {whyChooseUs.title}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            {whyChooseUs.description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {whyChooseUs.benefits.map((benefit, index) => {
            const Icon = benefitIcons[index] ?? CalendarCheck;

            return (
              <Card key={benefit.title} className="h-full">
                <CardHeader>
                  <div className="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-lg">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
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
