"use client";

import { formatNumber } from "./format";
import { Donut } from "./Donut";

export interface Leads {
  byType: { type: string; _count: { _all: number } }[];
  byStatus: { status: string; _count: { _all: number } }[];
  byVerified: { isVerifiedLead: boolean; _count: { _all: number } }[];
  total: number;
}

/** Lead quality: inquiry mix by type/status + verified-lead split. */
export function InquiryCharts({ data }: { data?: Leads }) {
  if (!data || data.total === 0) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant">
        No inquiries in this period yet.
      </p>
    );
  }

  const byType = data.byType.map((r) => ({
    key: r.type.replace(/_/g, " "),
    value: r._count._all,
  }));
  const byStatus = data.byStatus.map((r) => ({
    key: r.status.replace(/_/g, " "),
    value: r._count._all,
  }));
  const verified =
    data.byVerified.find((r) => r.isVerifiedLead)?._count._all ?? 0;
  const unverified =
    data.byVerified.find((r) => !r.isVerifiedLead)?._count._all ?? 0;

  return (
    <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
      <Donut data={byType} ariaLabel="Inquiries by type" />
      <Donut data={byStatus} ariaLabel="Inquiries by status" />
      <div className="sm:col-span-2">
        <p className="mb-xs font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
          Verified leads · {formatNumber(verified)} of{" "}
          {formatNumber(data.total)}
        </p>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-l-full bg-primary"
            style={{ width: `${(verified / Math.max(1, data.total)) * 100}%` }}
          />
          <div className="h-full flex-1 rounded-r-full bg-surface-container-high" />
        </div>
        <p className="mt-xs font-label-sm text-[11px] text-on-surface-variant">
          {formatNumber(unverified)} unverified · leads with a verified phone or
          saved-search history
        </p>
      </div>
    </div>
  );
}
