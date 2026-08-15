import { Badge, Button, Icon, cn } from "@repo/ui";
import Link from "next/link";
import type { CardProperty } from "lib/api/services/properties/types";
import { AddToCartButton } from "./AddToCartButton";
import { CompareToggleButton } from "./CompareToggleButton";
import { SaveToFavoritesButton } from "./SaveToFavoritesButton";

interface PropertyCardProps {
  property: {
    id: string;
    /** Real DB id — used by favorites/cart actions. */
    propertyId?: string;
    listingCode?: string;
    title: string;
    price: string;
    location: string;
    gradient: string;
    imageUrl?: string;
    meta: string[];
    /** Optional accent badge (e.g. "HOT", "FEATURED") shown over the image bottom-left. */
    badge?: string;
  };
  /** Fired when the save-to-favorites state changes (keeps wrappers in sync). */
  onFavoriteChange?: (isFavorite: boolean) => void;
  className?: string;
}

export function PropertyCard({
  property,
  onFavoriteChange,
  className,
}: PropertyCardProps) {
  const href = `/listing/${property.id}`;

  return (
    <article
      data-card
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg",
        className,
      )}
    >
      {/* Image Section */}
      <div className="relative">
        <Link
          href={href}
          className="block h-48 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label={`${property.title} — view details`}
        >
          {property.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external upload URL, see CartRow
            <img
              src={property.imageUrl}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className={`h-full w-full bg-gradient-to-br ${property.gradient} transition-transform duration-500 group-hover:scale-105`}
              aria-hidden
            />
          )}

          {/* Verified stamp — the archive's trust mark (DESIGN.md §2.2) */}
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded border border-tertiary/30 bg-surface/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tertiary">
            <Icon name="verified" filled className="text-[12px]" />
            Verified
          </span>

          {/* Accent badge (HOT / FEATURED) — bottom-left, clear of the actions */}
          {property.badge && (
            <Badge
              variant="destructive"
              className="absolute bottom-2.5 left-2.5 uppercase tracking-wide shadow-sm"
            >
              {property.badge}
            </Badge>
          )}
        </Link>

        {/* Save + compare — icon circles over the media (marketplace convention) */}
        <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5">
          <CompareToggleButton
            property={property as CardProperty}
            iconOnly
            className="size-9 rounded-full border border-outline-variant bg-surface/95 text-on-surface-variant shadow-sm backdrop-blur-sm hover:border-primary/40 hover:bg-surface-container hover:text-primary"
          />
          <SaveToFavoritesButton
            propertyId={property.propertyId ?? property.id}
            iconOnly
            onChange={onFavoriteChange}
            className="size-9 rounded-full border border-outline-variant bg-surface/95 text-on-surface-variant shadow-sm backdrop-blur-sm hover:border-tertiary/40 hover:bg-surface-container hover:text-tertiary"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="mb-2 font-headline-md text-body-lg font-semibold leading-snug text-on-surface line-clamp-2">
          <Link
            href={href}
            className="rounded transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {property.title}
          </Link>
        </h3>

        {/* Listing code — the ledger ID */}
        {property.listingCode && (
          <span className="mb-2.5 mono-stat inline-flex w-fit items-center rounded border border-outline-variant bg-surface-container px-1.5 py-0.5 text-[11px] font-medium text-on-surface-variant">
            {property.listingCode}
          </span>
        )}

        {/* Price — ledger mono, the primary scannable datum */}
        <p className="mb-2 mono-stat text-xl font-bold tracking-tight text-primary">
          {property.price}
        </p>

        {/* Location */}
        <div className="mb-2.5 flex items-center gap-1 text-xs font-medium text-secondary">
          <Icon name="location_on" className="shrink-0 text-[14px]" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Meta Information */}
        {property.meta.length > 0 && (
          <>
            <div
              className="my-2.5 h-px w-full border-t border-dashed border-outline-variant/80"
              aria-hidden
            />
            <div className="mb-3 space-y-1 text-xs text-on-surface-variant">
              {property.meta.slice(0, 3).map((m) => (
                <p key={m} className="flex items-start gap-1.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-on-surface-variant/40" />
                  <span className="line-clamp-1">{m}</span>
                </p>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="mt-auto grid grid-cols-2 gap-2">
          <AddToCartButton
            propertyId={property.propertyId ?? property.id}
            title={property.title}
            variant="ghost"
            className="rounded-md border border-outline-variant bg-transparent text-label-sm font-semibold text-on-surface shadow-none hover:border-primary hover:bg-surface-container hover:text-primary"
          />
          <Button
            asChild
            className="rounded-md bg-primary text-label-sm font-semibold text-on-primary hover:bg-primary/90"
          >
            <Link href={href}>
              View Details
              <Icon name="arrow_forward" className="text-on-primary/80" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
