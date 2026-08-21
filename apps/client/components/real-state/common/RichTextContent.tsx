"use client";

import { Icon, cn } from "@repo/ui";
import { useEffect, useRef, useState } from "react";

interface RichTextContentProps {
  html: string;
  className?: string;
  /** Maximum height in pixels before showing "Show more" button. Default 300px */
  maxHeight?: number;
}

function cleanHtml(rawHtml: string): string {
  if (!rawHtml) return "";
  return rawHtml
    .trim()
    .replace(/^(\s*<p[^>]*>(\s*<br\s*\/?>|\s*&nbsp;|\s*)*<\/p>|\s*<br\s*\/?>)+/gi, "")
    .replace(/(\s*<p[^>]*>(\s*<br\s*\/?>|\s*&nbsp;|\s*)*<\/p>|\s*<br\s*\/?>)+$/gi, "");
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

  const cleaned = cleanHtml(html);

  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setNeedsTruncation(scrollHeight > maxHeight);
    }
  }, [cleaned, maxHeight]);

  if (!cleaned) return null;

  return (
    <div className={cn("relative min-w-0", className)}>
      {/* Content container with truncation */}
      <div
        ref={contentRef}
        className={cn(
          "suneditor-content prose prose-sm max-w-none min-w-0 break-words text-pretty text-on-surface prose-p:my-0 [&_*]:mt-0 [&_p]:mt-0 [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80 [&_img]:h-auto [&_img]:max-w-full [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-5",
          !isExpanded && needsTruncation && "overflow-hidden",
        )}
        style={{
          maxHeight:
            !isExpanded && needsTruncation ? `${maxHeight}px` : undefined,
        }}
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />

      {/* Fade overlay + Show more button integrated together */}
      {!isExpanded && needsTruncation && (
        <div className="relative -mt-10 pt-8">
          {/* Smooth gradient fade over truncated text */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-t from-surface via-surface/90 to-transparent"
            aria-hidden="true"
          />
          {/* Appealing Show more button */}
          <div className="relative z-10 pt-2">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-outline-variant bg-surface px-3.5 py-1.5 text-xs font-semibold text-navy shadow-xs transition-all duration-150 hover:border-gold hover:bg-surface-container hover:text-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 active:scale-95"
            >
              <span>Show more</span>
              <Icon name="expand_more" className="text-[16px] text-gold" />
            </button>
          </div>
        </div>
      )}

      {/* Show less button when expanded */}
      {isExpanded && needsTruncation && (
        <div className="mt-3.5">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-outline-variant bg-surface px-3.5 py-1.5 text-xs font-semibold text-navy shadow-xs transition-all duration-150 hover:border-gold hover:bg-surface-container hover:text-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 active:scale-95"
          >
            <span>Show less</span>
            <Icon name="expand_less" className="text-[16px] text-gold" />
          </button>
        </div>
      )}
    </div>
  );
}
