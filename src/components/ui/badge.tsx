import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground bg-background",
        success:
          "border-success/20 bg-success/10 text-success dark:border-success/30 dark:bg-success/15",
        pending:
          "border-warning/25 bg-warning/15 text-warning-foreground dark:border-warning/30 dark:bg-warning/10",
        confirmed:
          "border-success/20 bg-success/10 text-success dark:border-success/30 dark:bg-success/15",
        cancelled:
          "border-danger/20 bg-danger/10 text-danger dark:border-danger/30 dark:bg-danger/15",
        paid: "border-primary/20 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15",
        expired: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
