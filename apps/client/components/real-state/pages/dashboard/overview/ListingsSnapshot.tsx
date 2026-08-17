import {
  cn,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import Link from "next/link";
import { EmptyState } from "components/real-state/layout/dashboard/EmptyState";
import { DEFAULT_STATUS_STYLE, STATUS_STYLES } from "../constants";
import type { DashboardListingSnapshot } from "lib/api/services/dashboard";

interface ListingsSnapshotProps {
  listings?: DashboardListingSnapshot[];
}

export function ListingsSnapshot({ listings }: ListingsSnapshotProps) {
  const items = listings ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon="list_alt"
        title="Your archive is empty"
        description="List your first verified property to see it here."
        action={
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center gap-1 rounded-md bg-gold text-on-gold px-4 py-2 text-sm font-medium hover:bg-gold/90 transition-colors"
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
        <h3 className="flex items-center gap-2.5 font-headline-md text-base font-bold tracking-tight text-navy">
          <span className="h-4 w-1 rounded-full bg-gold" aria-hidden />
          My Listings
        </h3>
        <Link
          href="/my-listings"
          className="font-label-sm text-label-sm text-gold-deep font-medium hover:underline inline-flex items-center gap-0.5"
        >
          View all
          <Icon name="arrow_forward" className="text-[14px]" />
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-outline-variant hover:bg-transparent">
            <TableHead className="h-auto px-xs py-2 font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
              Listing
            </TableHead>
            <TableHead className="h-auto px-xs py-2 text-right font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
              Views
            </TableHead>
            <TableHead className="h-auto px-xs py-2 text-right font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
              Manage
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const status = STATUS_STYLES[item.status] ?? DEFAULT_STATUS_STYLE;
            return (
              <TableRow
                key={item.id}
                className="border-outline-variant hover:bg-surface-container-high transition-colors"
              >
                <TableCell className="px-xs py-3">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="mono-stat text-[12px] text-on-surface-variant">
                        {item.listingCode}
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
                </TableCell>
                <TableCell className="px-xs py-3 text-right">
                  <span className="mono-stat text-label-sm text-on-surface tabular-nums">
                    {item.views}
                  </span>
                </TableCell>
                <TableCell className="px-xs py-3 text-right">
                  <Link
                    href={`/my-listings/new?slug=${item.slug}`}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                    aria-label={`Manage ${item.listingCode}`}
                  >
                    <Icon name="manage_accounts" className="text-body-lg" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
