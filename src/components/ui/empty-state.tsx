import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  tips?: React.ReactNode;
  className?: string;
  variant?: "card" | "plain";
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  tips,
  className,
  variant = "card",
}: EmptyStateProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center gap-6 py-12 text-center sm:py-16",
        className,
      )}
    >
      <div
        className="border-border bg-muted/60 flex size-16 items-center justify-center rounded-full border"
        aria-hidden
      >
        <Icon className="text-muted-foreground size-7" strokeWidth={1.5} />
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {tips ? (
        <div className="text-muted-foreground max-w-md text-sm">{tips}</div>
      ) : null}

      {action || secondaryAction ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );

  if (variant === "plain") {
    return content;
  }

  return (
    <Card>
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  );
}
