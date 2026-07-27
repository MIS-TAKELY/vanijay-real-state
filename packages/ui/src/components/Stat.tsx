import React from "react";

import { cn } from "../lib/utils";

interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  label: string;
  align?: "left" | "center";
}

const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ value, label, align = "left", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col",
          align === "center" && "items-center text-center",
          className
        )}
        {...props}
      >
        <span className="mono-stat text-data-price text-primary tracking-tighter font-bold">
          {value}
        </span>
        <span className="font-label-sm text-[11px] text-outline uppercase tracking-widest">
          {label}
        </span>
      </div>
    );
  }
);

Stat.displayName = "Stat";

export { Stat };
export type { StatProps };
