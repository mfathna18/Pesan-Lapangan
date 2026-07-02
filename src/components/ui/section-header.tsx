import { cn } from "@/lib/utils";
import { layout, typography } from "@/lib/design-system";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        align === "center" ? layout.sectionHeader : "max-w-2xl space-y-4",
        className,
      )}
    >
      {eyebrow ? <p className={typography.eyebrow}>{eyebrow}</p> : null}
      <h2 className={typography.h2}>{title}</h2>
      {description ? (
        <p className={cn(typography.body, "text-muted-foreground")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
