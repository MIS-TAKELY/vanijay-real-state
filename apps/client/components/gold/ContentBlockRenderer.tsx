"use client";

import type { ContentBlock } from "../../constants/gold/content-blocks";

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

function renderBody(body: string) {
  // Simple markdown-like rendering for bold and line breaks
  const parts = body.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-on-surface">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Handle line breaks
    const lines = part.split("\n");
    return lines.map((line, j) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < lines.length - 1 && <br />}
      </span>
    ));
  });
}

export function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-10">
      {blocks.map((block) => (
        <article
          key={block.id}
          className="rounded-xl border border-outline-variant bg-surface p-6 shadow-sm md:p-8"
        >
          <div>
            <h3
              className="mb-2 text-xl font-medium tracking-tight text-on-surface"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {block.title}
            </h3>
            {block.subtitle && (
              <p className="mb-4 text-sm text-on-surface-variant">
                {block.subtitle}
              </p>
            )}
            <div
              className="text-sm leading-relaxed text-on-surface-variant"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {renderBody(block.body)}
            </div>
            {block.ctaText && block.ctaLink && (
              <a
                href={block.ctaLink}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold-deep transition-colors hover:text-gold"
              >
                {block.ctaText}
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}