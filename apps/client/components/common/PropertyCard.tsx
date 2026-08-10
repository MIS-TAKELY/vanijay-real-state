import { Button, Icon } from "@repo/ui";
import Link from "next/link";
import { AddToCartButton } from "./AddToCartButton";
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
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      {/* Image Section */}
      <Link
        href={`/listing/${property.id}`}
        className="relative h-44 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        aria-label={`${property.title} — view details`}
      >
        {property.imageUrl ? (
          <img
            src={property.imageUrl}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`h-full w-full bg-gradient-to-br ${property.gradient} transition-transform duration-500 group-hover:scale-105`}
            aria-hidden
          />
        )}
        
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-surface/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-tertiary">
          <Icon name="verified" filled className="text-[11px]" />
          Verified
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Location */}
        <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-secondary">
          <Icon name="location_on" className="text-[13px]" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Title */}
        <h3 className="mb-2 font-headline-md text-base font-semibold leading-snug text-on-surface line-clamp-2">
          <Link
            href={`/listing/${property.id}`}
            className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          >
            {property.title}
          </Link>
        </h3>

        {/* Price */}
        <p className="mb-3 mono-stat text-xl font-bold text-primary tracking-tight">
          {property.price}
        </p>

        {/* Meta Information */}
        {property.meta.length > 0 && (
          <div className="mb-3 space-y-1 text-xs text-on-surface-variant">
            {property.meta.slice(0, 3).map((m) => (
              <p key={m} className="flex items-start gap-1.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-on-surface-variant/40" />
                <span className="line-clamp-1">{m}</span>
              </p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex gap-2">
            <AddToCartButton
              propertyId={property.propertyId ?? property.id}
              title={property.title}
              className="flex-1 rounded-md border-outline-variant py-2 text-label-sm font-semibold text-on-surface hover:border-primary hover:text-primary"
            />
            <Button
              asChild
              className="flex-1 rounded-md bg-primary py-2 text-label-sm font-semibold text-on-primary hover:bg-primary/90"
            >
              <Link href={`/listing/${property.id}`}>
                View Details
                <Icon name="arrow_forward" className="text-on-primary/80" />
              </Link>
            </Button>
          </div>
          <SaveToFavoritesButton
            propertyId={property.propertyId ?? property.id}
            variant="ghost"
            className="w-full rounded-md py-1.5 text-label-sm font-medium text-on-surface-variant hover:text-on-surface"
          />
        </div>
      </div>
    </article>
  );
}
