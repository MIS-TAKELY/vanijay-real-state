import React from "react";

import { cn } from "../lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ padding = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "max-w-[1280px] mx-auto",
          padding && "px-gutter",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Container.displayName = "Container";

export { Container };
export type { ContainerProps };
