import Link from "next/link";
import { Icon } from "@repo/ui";

interface PropertyCardProps {
  property: {
    id: string;
    listingCode?: string;
    title: string;
    price: string;
    location: string;
    gradient: string;
    meta: string[];
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      {/* Image — links to detail page */}
      <Link
        href={`/listings/${property.id}`}
        className="relative h-48 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label={`${property.title} — view details`}
      >
        <div
          className={`h-full w-full bg-gradient-to-br ${property.gradient} transition-transform duration-500 group-hover:scale-105`}
          aria-hidden
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-surface/95 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.6px] text-tertiary shadow-sm">
          <Icon name="verified" filled className="text-[12px]" />
          Verified Archive
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-md">
        <h3 className="mb-xs font-headline-md text-lg font-medium leading-6 text-on-surface">
          <Link
            href={`/listings/${property.id}`}
            className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          >
            {property.title}
          </Link>
        </h3>

        <span className="mb-sm inline-block w-fit rounded bg-surface-container px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
          ID: {property.listingCode ?? property.id}
        </span>

        <p className="mb-0.5 mono-stat text-lg font-semibold text-primary">
          {property.price}
        </p>
        <p className="mb-md text-sm text-on-surface-variant">
          {property.location}
        </p>

        <div className="mb-md space-y-1 border-t border-outline-variant pt-sm text-sm text-on-surface-variant">
          {property.meta.map((m) => (
            <p key={m} className="flex items-center gap-1.5">
              <span className="text-on-surface-variant">&middot;</span> {m}
            </p>
          ))}
        </div>

        <div className="mt-auto flex gap-2">
          <button
            type="button"
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-outline-variant py-2.5 text-[13px] font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Icon name="add_shopping_cart" className="text-[16px]" />
            Add to Cart
          </button>
          <Link
            href={`/listings/${property.id}`}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary py-2.5 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            View Details
            <Icon name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      </div>
    </article>
  );
}
