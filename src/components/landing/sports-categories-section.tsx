import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { landingContent } from "@/config/landing";

export function SportsCategoriesSection() {
  const { sportsCategories } = landingContent;

  return (
    <section id="kategori" className="bg-muted/40 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <Badge variant="secondary">Olahraga Populer</Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {sportsCategories.title}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            {sportsCategories.description}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sportsCategories.categories.map((category) => (
            <Card key={category.name} className="h-full">
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {category.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
