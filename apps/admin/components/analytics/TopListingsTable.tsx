"use client";

import { formatNpr, formatNumber } from "@repo/ui";
import { AdminDataTable } from "components/AdminDataTable";
import type { TopListing } from "lib/api";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-surface-container text-on-surface-variant",
  UNDER_VERIFICATION: "bg-amber/15 text-amber",
  LIVE: "bg-primary/15 text-primary",
  SOLD: "bg-secondary/15 text-secondary",
  ARCHIVED: "bg-surface-container text-on-surface-variant",
  REJECTED: "bg-error/15 text-error",
};

/** Top-performing listings by views, with engagement metrics for the period. */
export function TopListingsTable({ listings }: { listings: TopListing[] }) {
  if (listings.length === 0) {
    return <p className="font-body-md text-body-md text-on-surface-variant">No listing views recorded yet.</p>;
  }

  return (
    <AdminDataTable
      minWidth={560}
      columns={[
        "#",
        "Listing",
        "Location",
        "Status",
        { label: "Views", align: "right" },
        { label: "Inquiries", align: "right" },
        { label: "Favorites", align: "right" },
        { label: "Calls", align: "right" },
      ]}
    >
      {listings.map((row, i) => (
        <AdminDataTable.Row key={row.id}>
          <AdminDataTable.Cell className="mono-stat text-[12px] text-on-surface-variant">{i + 1}</AdminDataTable.Cell>
          <AdminDataTable.Cell>
            <p className="font-medium text-on-surface">{row.title}</p>
            <p className="mono-stat text-[11px] text-on-surface-variant">
              {row.listingCode} · {formatNpr(row.askingPrice)}
            </p>
          </AdminDataTable.Cell>
          <AdminDataTable.Cell className="text-on-surface-variant">{row.location}</AdminDataTable.Cell>
          <AdminDataTable.Cell>
            <span
              className={
                "inline-flex rounded px-1.5 py-0.5 font-label-sm mono-stat text-[10px] font-bold uppercase tracking-widest " +
                (STATUS_STYLE[row.status] ?? "bg-surface-container text-on-surface-variant")
              }
            >
              {row.status.replace(/_/g, " ")}
            </span>
          </AdminDataTable.Cell>
          <AdminDataTable.Cell className="mono-stat text-right text-on-surface">{formatNumber(row.views)}</AdminDataTable.Cell>
          <AdminDataTable.Cell className="mono-stat text-right text-on-surface">{formatNumber(row.inquiries)}</AdminDataTable.Cell>
          <AdminDataTable.Cell className="mono-stat text-right text-on-surface">{formatNumber(row.favorites)}</AdminDataTable.Cell>
          <AdminDataTable.Cell className="mono-stat text-right text-on-surface">{formatNumber(row.phoneClicks)}</AdminDataTable.Cell>
        </AdminDataTable.Row>
      ))}
    </AdminDataTable>
  );
}
