import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        {eyebrow ? <p className={typography.eyebrow}>{eyebrow}</p> : null}
        <h1 className={typography.h1}>{title}</h1>
        {description ? (
          <p
            className={cn(typography.bodySm, "text-muted-foreground max-w-2xl")}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
