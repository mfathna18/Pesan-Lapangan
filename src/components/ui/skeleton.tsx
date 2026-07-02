import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-muted animate-pulse rounded-[var(--radius-md)] motion-reduce:animate-none",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}

export { Skeleton };
