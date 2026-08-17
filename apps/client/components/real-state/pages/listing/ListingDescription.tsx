"use client";

import { RichTextContent } from "components/real-state/common/RichTextContent";

interface ListingDescriptionProps {
  html: string;
}

/**
 * Client component wrapper for rendering listing description with rich text
 * styling and show more/less functionality.
 */
export function ListingDescription({ html }: ListingDescriptionProps) {
  if (!html) return null;

  return (
    <section className="mt-5">
      <h2 className="mb-3 flex items-center gap-2.5 font-headline-md text-lg font-semibold tracking-tight text-navy">
        <span className="h-4 w-1 rounded-full bg-gold" aria-hidden />
        Description
      </h2>
      <RichTextContent html={html} maxHeight={300} />
    </section>
  );
}
