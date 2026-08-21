"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, cn } from "@repo/ui";

interface ListingDescriptionProps {
  html: string;
}

/** Maximum height in px before the "Show more" toggle appears. */
const COLLAPSE_PX = 120;

function cleanHtml(rawHtml: string): string {
  if (!rawHtml) return "";
  return rawHtml
    .trim()
    .replace(/^(\s*<p[^>]*>(\s*<br\s*\/?>|\s*&nbsp;|\s*)*<\/p>|\s*<br\s*\/?>)+/gi, "")
    .replace(/(\s*<p[^>]*>(\s*<br\s*\/?>|\s*&nbsp;|\s*)*<\/p>|\s*<br\s*\/?>)+$/gi, "");
}

/**
 * Renders the listing description with a "Show more / Show less" toggle.
 * The toggle only appears when the content overflows the collapsed height.
 */
export function ListingDescription({ html }: ListingDescriptionProps) {
  const cleaned = cleanHtml(html);
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Measure intrinsic height via ResizeObserver so we catch layout + image loads
  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    // Remove collapse constraint so we can measure full height
    setExpanded(false);
    setNeedsToggle(false);

    let cancelled = false;

    // Wait a tick for styles to apply then measure
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      const fullH = inner.scrollHeight;
      if (fullH > COLLAPSE_PX + 4) {
        setNeedsToggle(true);
      }
    });

    // Also watch for late-loading content (images etc.)
    const ro = new ResizeObserver(() => {
      if (cancelled) return;
      // Only re-check if we're still collapsed
      setNeedsToggle((prev) => {
        const h = inner.scrollHeight;
        return h > COLLAPSE_PX + 4;
      });
    });
    ro.observe(inner);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [cleaned]);

  if (!cleaned) return null;

  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="font-headline-md text-lg font-semibold tracking-tight text-navy">
        Description
      </h2>

      {/* Content wrapper — controls clipping */}
      <div ref={wrapRef} className="relative">
        <div
          ref={innerRef}
          className={cn(
            "suneditor-content prose prose-sm max-w-none min-w-0 break-words text-pretty text-on-surface",
            "prose-p:my-0 [&_*]:mt-0 [&_p]:mt-0 [&_p]:mb-2.5 [&_p:last-child]:mb-0",
            "[&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80",
            "[&_img]:h-auto [&_img]:max-w-full [&_li]:my-1",
            "[&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
            "[&_pre]:max-w-full [&_pre]:overflow-x-auto",
            "[&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto",
          )}
          style={
            needsToggle && !expanded
              ? { maxHeight: COLLAPSE_PX, overflow: "hidden" }
              : undefined
          }
          dangerouslySetInnerHTML={{ __html: cleaned }}
        />

        {/* Fade mask when collapsed */}
        {needsToggle && !expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
        )}
      </div>

      {/* Toggle button */}
      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 self-start text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {expanded ? "Show less" : "Show more"}
          <Icon
            name={expanded ? "expand_less" : "expand_more"}
            className="text-[18px]"
          />
        </button>
      )}
    </section>
  );
}
