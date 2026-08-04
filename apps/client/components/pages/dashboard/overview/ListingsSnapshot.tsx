import { cn, Icon } from "@repo/ui";
import Link from "next/link";
import { EmptyState } from "../../../common/dashboard/EmptyState";
import {
  DEFAULT_STATUS_STYLE,
  SNAPSHOT_LISTINGS,
  STATUS_STYLES,
} from "../constants";

export function ListingsSnapshot() {
  const items = SNAPSHOT_LISTINGS;

  if (items.length === 0) {
    return (
      <EmptyState
        icon="list_alt"
        title="Your archive is empty"
        description="List your first verified property to see it here."
        action={
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center gap-1 rounded-md bg-primary text-on-primary px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="add" className="text-data-table" />
            List your first property
          </Link>
        }
      />
    );
  }

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-md">
      <div className="flex items-center justify-between mb-sm">
        <h3 className="font-headline-md text-base font-semibold text-on-surface flex items-center gap-xs">
          <Icon
            name="list_alt"
            className="text-[20px] text-on-surface-variant"
          />
          My Listings
        </h3>
        <Link
          href="/my-listings"
          className="font-label-sm text-label-sm text-primary font-medium hover:underline inline-flex items-center gap-0.5"
        >
          View all
          <Icon name="arrow_forward" className="text-[14px]" />
        </Link>
      </div>

      <div className="flex flex-col">
        {/* header row */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-sm px-xs py-2 border-b border-outline-variant">
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
            Listing
          </span>
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
            Views
          </span>
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
            Manage
          </span>
        </div>

        {items.map((item) => {
          const status = STATUS_STYLES[item.status] ?? DEFAULT_STATUS_STYLE;
          return (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-sm px-xs py-3 border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors"
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="mono-stat text-[12px] text-on-surface-variant">
                    {item.code}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
                      status.chip,
                    )}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
                    />
                    {status.label}
                  </span>
                </div>
                <span className="font-body-md text-sm text-on-surface truncate">
                  {item.title}
                </span>
              </div>
              <span className="mono-stat text-label-sm text-on-surface tabular-nums">
                {item.views}
              </span>
              <Link
                href={`/dashboard/listings/${item.id}`}
                className="inline-flex items-center justify-center h-7 w-7 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                aria-label={`Manage ${item.code}`}
              >
                <Icon name="manage_accounts" className="text-body-lg" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
