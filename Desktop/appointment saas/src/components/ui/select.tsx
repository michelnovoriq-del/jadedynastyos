import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-12 w-full rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.7)] px-4 text-sm text-[var(--foreground)] focus:border-[var(--accent)]",
      className,
    )}
    {...props}
  />
));

Select.displayName = "Select";

