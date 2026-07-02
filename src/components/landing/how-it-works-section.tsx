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

export function HowItWorksSection() {
  const { howItWorks } = landingContent;

  return (
    <section id="cara-kerja" className={`${layout.section} scroll-mt-20`}>
      <div className={`${layout.container} flex flex-col gap-12`}>
        <SectionHeader
          title={howItWorks.title}
          description={howItWorks.description}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.steps.map((item) => (
            <Card key={item.step} className="h-full">
              <CardHeader className="gap-3">
                <p className="text-primary text-xs font-semibold tracking-widest">
                  LANGKAH {item.step}
                </p>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
