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
    <section className="flex flex-col gap-1.5">
      <h2 className="font-headline-md text-lg font-semibold tracking-tight text-navy">
        Description
      </h2>
      <RichTextContent html={html} maxHeight={280} />
    </section>
  );
}
