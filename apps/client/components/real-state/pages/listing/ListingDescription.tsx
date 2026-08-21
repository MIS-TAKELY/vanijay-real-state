"use client";

import { cn } from "@repo/ui";

interface ListingDescriptionProps {
  html: string;
}

function cleanHtml(rawHtml: string): string {
  if (!rawHtml) return "";
  return rawHtml
    .trim()
    .replace(/^(\s*<p[^>]*>(\s*<br\s*\/?>|\s*&nbsp;|\s*)*<\/p>|\s*<br\s*\/?>)+/gi, "")
    .replace(/(\s*<p[^>]*>(\s*<br\s*\/?>|\s*&nbsp;|\s*)*<\/p>|\s*<br\s*\/?>)+$/gi, "");
}

/**
 * Renders the full listing description without any collapse/expand behaviour.
 * All text is always visible so buyers don't miss any details.
 */
export function ListingDescription({ html }: ListingDescriptionProps) {
  const cleaned = cleanHtml(html);
  if (!cleaned) return null;

  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="font-headline-md text-lg font-semibold tracking-tight text-navy">
        Description
      </h2>
      <div
        className={cn(
          "suneditor-content prose prose-sm max-w-none min-w-0 break-words text-pretty text-on-surface",
          "prose-p:my-0 [&_*]:mt-0 [&_p]:mt-0 [&_p]:mb-2.5 [&_p:last-child]:mb-0",
          "[&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80",
          "[&_img]:h-auto [&_img]:max-w-full [&_li]:my-1",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_pre]:max-w-full [&_pre]:overflow-x-auto",
          "[&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto",
        )}
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />
    </section>
  );
}
