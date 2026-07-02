import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { landingContent } from "@/config/landing";
import { layout } from "@/lib/design-system";

export function TestimonialsSection() {
  const { testimonials } = landingContent;

  return (
    <section className={`${layout.section} bg-muted/40`}>
      <div className={`${layout.container} flex flex-col gap-12`}>
        <SectionHeader
          title={testimonials.title}
          description={testimonials.description}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.items.map((item) => (
            <Card key={item.name} className="h-full">
              <CardContent className="flex h-full flex-col gap-6 pt-6">
                <p className="text-foreground flex-1 text-sm leading-relaxed sm:text-base">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="border-border space-y-1 border-t pt-4">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-xs">{item.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
