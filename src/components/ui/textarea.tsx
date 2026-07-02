import * as React from "react";

import { focusRing, transition } from "@/lib/design-system";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-background text-foreground placeholder:text-muted-foreground flex field-sizing-content min-h-28 w-full rounded-[var(--radius-input)] border px-4 py-3 text-sm leading-relaxed",
        transition,
        focusRing,
        "focus-visible:border-ring aria-invalid:border-danger aria-invalid:ring-danger/20",
        "disabled:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60",
        "dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
