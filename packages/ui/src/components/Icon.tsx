import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const iconVariants = cva("material-symbols-outlined", {
  variants: {
    size: {
      sm: "text-[16px]",
      md: "text-[24px]",
      lg: "text-[32px]",
      xl: "text-[40px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface IconProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof iconVariants> {
  name: string;
  filled?: boolean;
}

const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ name, size = "md", filled = false, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(iconVariants({ size, className }))}
        style={{
          fontVariationSettings: filled
            ? "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24"
            : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
        }}
        {...props}
      >
        {name}
      </span>
    );
  }
);

Icon.displayName = "Icon";

export { Icon, iconVariants };
export type { IconProps };
