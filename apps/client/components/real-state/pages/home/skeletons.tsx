/**
 * Shared loading placeholders for the homepage listing rails.
 *
 * Every skeleton mirrors the exact geometry of its loaded counterpart
 * (card widths from HorizontalScrollSection's rail, heights measured from
 * PropertyCard's aspect-ratio image + content body). Matching boxes keep
 * CLS at zero when client-fetched listings hydrate.
 */

export function CardRailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className="w-[180px] h-[264px] sm:w-[220px] sm:h-[300px] md:w-[280px] md:h-[356px] shrink-0 animate-pulse rounded-md bg-surface-container"
        />
      ))}
    </>
  );
}

/** Section header + scroll-row chrome shared by every listing-rail section,
 *  so loading → loaded swaps only replace the cards themselves. */
export function RailSectionSkeleton({
  title,
  count = 4,
  tinted = false,
}: {
  title: string;
  count?: number;
  tinted?: boolean;
}) {
  return (
    <section className={`py-6 md:py-14 relative z-10 ${tinted ? "bg-surface-container-low" : ""}`}>
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex items-end justify-between mb-4 md:mb-6 gap-3">
          <h2 className="font-headline-md text-xl md:text-headline-md text-primary font-bold tracking-tight min-w-0 truncate">
            {title}
          </h2>
        </div>
        <div className="flex min-w-0 gap-3 overflow-x-auto overscroll-x-contain pb-3 pt-1 md:gap-4 md:pb-4 md:pt-2">
          <CardRailSkeleton count={count} />
        </div>
      </div>
    </section>
  );
}
