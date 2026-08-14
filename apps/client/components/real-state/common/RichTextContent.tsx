"use client";

import { cn } from "@repo/ui";
import { useEffect, useRef, useState } from "react";

interface RichTextContentProps {
  html: string;
  className?: string;
  /** Maximum height in pixels before showing "Show more" button. Default 300px */
  maxHeight?: number;
}

/**
 * Renders HTML content with optional show more/less functionality.
 * Uses the same styling as the editor output for visual consistency.
 */
export function RichTextContent({
  html,
  className,
  maxHeight = 300,
}: RichTextContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setNeedsTruncation(scrollHeight > maxHeight);
    }
  }, [html, maxHeight]);

  if (!html) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Content container with truncation */}
      <div
        ref={contentRef}
        className={cn(
          "suneditor-content prose prose-sm max-w-none text-on-surface-variant [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p]:last:mb-0 [&_ul]:list-disc [&_ul]:pl-5",
          !isExpanded && needsTruncation && "overflow-hidden",
        )}
        style={{
          maxHeight: !isExpanded && needsTruncation ? `${maxHeight}px` : undefined,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Fade overlay + Show more button integrated together */}
      {!isExpanded && needsTruncation && (
        <div className="relative mt-0">
          {/* Gradient fade that sits at the bottom of truncated content */}
          <div
            className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-surface to-transparent pointer-events-none"
            aria-hidden="true"
          />
          {/* Button positioned below the gradient zone */}
          <div className="relative z-10 pt-2">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-sm font-medium text-primary hover:text-primary/80 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:rounded"
            >
              Show more
            </button>
          </div>
        </div>
      )}

      {/* Show less button when expanded */}
      {isExpanded && needsTruncation && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-sm font-medium text-primary hover:text-primary/80 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:rounded"
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
}
