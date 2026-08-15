"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Icon, Input } from "@repo/ui";
import { cn } from "@repo/ui";
import { PageHeader } from "components/ui/PageHeader";
import { adminProperties, AdminProperty } from "lib/api";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Live", value: "LIVE" },
  { label: "Under Verification", value: "UNDER_VERIFICATION" },
  { label: "Draft", value: "DRAFT" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Archived", value: "ARCHIVED" },
];

export default function ListingsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<AdminProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [take] = useState(50);
  const [skip, setSkip] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProperties({
        search: search || undefined,
        status: status || undefined,
        take,
        skip,
      });
      setRows(res.items);
      setTotal(res.total);
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, status, take, skip]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(total / take));
  const currentPage = Math.floor(skip / take) + 1;

  return (
    <>
      <PageHeader
        icon="list_alt"
        title="Listings"
        description={`${total} properties — ${status ? status.replaceAll("_", " ").toLowerCase() : "all statuses"}`}
      />

      <section className="mt-lg">
        <div className="mb-md flex flex-wrap items-center gap-sm">
          <Input
            placeholder="Search by title, code, or location…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSkip(0); }}
            className="w-full max-w-xs bg-surface"
          />
          <div className="flex flex-wrap items-center gap-xs">
            {STATUS_OPTIONS.map((opt) => {
              const active = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setStatus(opt.value); setSkip(0); }}
                  className={cn(
                    "font-label-sm mono-stat text-[11px] font-bold uppercase tracking-widest rounded-full px-3 py-1.5 transition-colors",
                    active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="admin-surface border border-outline-variant rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-outline-variant bg-surface-container-low font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
                <tr>
                  <th className="px-md py-3">Code</th>
                  <th className="px-md py-3">Title</th>
                  <th className="px-md py-3">Type</th>
                  <th className="px-md py-3">Price</th>
                  <th className="px-md py-3">Status</th>
                  <th className="px-md py-3">Owner</th>
                  <th className="px-md py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {loading ? (
                  <tr><td colSpan={7} className="px-md py-lg text-center text-on-surface-variant">Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} className="px-md py-lg text-center text-on-surface-variant">No listings found.</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-container/60">
                      <td className="mono-stat px-md py-3 text-[12px] text-on-surface-variant">{r.listingCode}</td>
                      <td className="px-md py-3 font-medium text-on-surface">{r.title}</td>
                      <td className="px-md py-3 text-on-surface-variant">{r.propertyType}</td>
                      <td className="mono-stat px-md py-3 text-on-surface">{r.askingPrice}</td>
                      <td className="px-md py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-md py-3 text-on-surface-variant">{r.owner?.name || "—"}</td>
                      <td className="mono-stat px-md py-3 text-[12px] text-on-surface-variant">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {total > take && (
          <div className="mt-md flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              Page {currentPage} of {pageCount} ({total} total)
            </span>
            <div className="flex gap-xs">
              <Button variant="outline" size="sm" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - take))}>
                ← Prev
              </Button>
              <Button variant="outline" size="sm" disabled={skip + take >= total} onClick={() => setSkip(skip + take)}>
                Next →
              </Button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "LIVE" ? "text-primary bg-secondary-container" :
    status === "REJECTED" ? "text-error bg-error/10" :
    status === "UNDER_VERIFICATION" ? "text-tertiary bg-tertiary/10" :
    "bg-surface-container text-on-surface-variant";
  return (
    <span className={"inline-flex rounded-full px-2 py-0.5 font-label-sm text-[11px] font-semibold " + tone}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
