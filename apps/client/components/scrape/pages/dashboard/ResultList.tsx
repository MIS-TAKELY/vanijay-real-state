import {
  ArrowUpRight,
  BadgeCheck,
  Handshake,
  MapPin,
  User,
  Clock3,
} from "lucide-react";
import { formatPrice, slugify } from "lib/scrape/hamrobazaar";
import type { HamrobazaarListing } from "lib/scrape/hamrobazaar";

function ListingCard({ listing }: { listing: HamrobazaarListing }) {
  const externalUrl = `https://hamrobazaar.com${listing.detailUrl}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-scrape-border bg-scrape-surface transition-all duration-300 hover:-translate-y-1 hover:border-scrape-primary/40 hover:shadow-[0_16px_44px_-16px_rgba(79,140,255,0.3)]">
      {/* Image / placeholder */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#1e2430] via-scrape-surface-2 to-scrape-surface">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={
            listing.imageUrl
              ? { backgroundImage: `url(${listing.imageUrl})` }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded-md border border-scrape-border/60 bg-black/50 px-2 py-1 font-scrape-mono text-[10px] text-scrape-cyan backdrop-blur-sm">
          {listing.categoryName}
        </span>
        <span className="absolute bottom-3 right-3 rounded-md bg-scrape-primary px-2.5 py-1 font-scrape-mono text-sm font-semibold text-[#0a0e16] shadow-lg">
          {formatPrice(listing.price)}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-scrape-on-bg">
          {listing.title}
        </h3>

        <p className="mt-2 flex items-start gap-1.5 text-[13px] text-scrape-muted">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-scrape-primary" />
          <span className="line-clamp-2 leading-snug">{listing.location}</span>
        </p>

        <div className="mt-3 space-y-1 text-[12px] text-scrape-muted">
          <p className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {listing.seller}
          </p>
          <p className="flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {listing.createdTime || "recent"}
          </p>
        </div>

        {/* Chips */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-md border border-scrape-border bg-scrape-surface-2 px-2 py-0.5 font-scrape-mono text-[10px] text-scrape-on-bg/80">
            {listing.condition}
          </span>
          {listing.negotiable && (
            <span className="flex items-center gap-1 rounded-md border border-scrape-success/25 bg-scrape-success/10 px-2 py-0.5 font-scrape-mono text-[10px] text-scrape-success">
              <Handshake className="h-3 w-3" />
              Negotiable
            </span>
          )}
          <span className="flex items-center gap-1 rounded-md border border-scrape-accent/25 bg-scrape-accent/10 px-2 py-0.5 font-scrape-mono text-[10px] text-scrape-accent">
            <BadgeCheck className="h-3 w-3" />
            NPR
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-scrape-border pt-3">
          <span className="font-scrape-mono text-[10px] text-scrape-muted">
            #{slugify(listing.id)}
          </span>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-scrape-mono text-xs text-scrape-primary transition-colors hover:text-scrape-cyan"
          >
            View on Hamrobazaar
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function ResultList({ items }: { items: HamrobazaarListing[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-scrape-border bg-scrape-surface p-10 text-center">
        <p className="font-scrape-mono text-sm text-scrape-muted">
          No listings returned. Try a different category or keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
