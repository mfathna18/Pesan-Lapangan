import { typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type CustomerFunnelHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function CustomerFunnelHeader({
  eyebrow,
  title,
  description,
  className,
}: CustomerFunnelHeaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className={typography.eyebrow}>{eyebrow}</p>
      <h1 className={typography.h1}>{title}</h1>
      {description ? (
        <p className={cn(typography.bodySm, "text-muted-foreground max-w-2xl")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
