import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { landingContent } from "@/config/landing";

export function HowItWorksSection() {
  const { howItWorks } = landingContent;

  return (
    <section id="cara-kerja" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {howItWorks.title}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            {howItWorks.description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.steps.map((item) => (
            <Card key={item.step} className="h-full">
              <CardHeader>
                <p className="text-primary text-sm font-semibold">
                  {item.step}
                </p>
                <CardTitle>{item.title}</CardTitle>
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
