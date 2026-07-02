import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { focusRing, transition } from "@/lib/design-system";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "border-input bg-background text-foreground file:text-foreground placeholder:text-muted-foreground h-11 min-h-[var(--control-height-md)] w-full min-w-0 rounded-[var(--radius-input)] border px-4 py-2 text-sm",
        transition,
        focusRing,
        "focus-visible:border-ring aria-invalid:border-danger aria-invalid:ring-danger/20",
        "disabled:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60",
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
