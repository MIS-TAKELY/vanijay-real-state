import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const sectionVariants = cva("py-xl relative z-10", {
  variants: {
    bg: {
      surface: "bg-surface",
      "surface-container": "bg-surface-container",
      "surface-container-low": "bg-surface-container-low",
      "surface-container-highest": "bg-surface-container-highest",
      primary: "bg-primary",
    },
    border: {
      top: "border-t border-outline-variant",
      bottom: "border-b border-outline-variant",
      both: "border-y border-outline-variant",
      none: "",
    },
    z: {
      true: "relative z-10",
      false: "",
    },
  },
  defaultVariants: {
    bg: "surface",
    border: "none",
    z: true,
  },
});

interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ bg = "surface", border = "none", z = true, className, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(sectionVariants({ bg, border, z, className }))}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

export { Section, sectionVariants };
export type { SectionProps };
