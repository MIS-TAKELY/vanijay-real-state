"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Loader2,
  MAIN_CATEGORY_LABELS,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "@repo/ui";
import { cn } from "@repo/ui";
import { AdminDataTable } from "components/AdminDataTable";
import { PageHeader } from "components/ui/PageHeader";
import { adminModerateProperty, adminProperties, AdminProperty } from "lib/api";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Live", value: "LIVE" },
  { label: "Under Verification", value: "UNDER_VERIFICATION" },
  { label: "Draft", value: "DRAFT" },
  { label: "Sold", value: "SOLD" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Archived", value: "ARCHIVED" },
];

const STATUS_LABEL: Record<string, string> = {
  LIVE: "Live",
  UNDER_VERIFICATION: "Under Verification",
  DRAFT: "Draft",
  SOLD: "Sold",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

const STATUS_DOT: Record<string, string> = {
  LIVE: "bg-primary",
  UNDER_VERIFICATION: "bg-tertiary",
  DRAFT: "bg-on-surface-variant/60",
  SOLD: "bg-secondary",
  REJECTED: "bg-error",
  ARCHIVED: "bg-on-surface-variant/30",
};

const PAGE_SIZES = [10, 25, 50, 100];

export default function ListingsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<AdminProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [take, setTake] = useState(10);
  const [skip, setSkip] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);

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

  const pages = useMemo(() => {
    const list: (number | "…")[] = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) list.push(i);
    } else {
      list.push(1);
      if (currentPage > 3) list.push("…");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(pageCount - 1, currentPage + 1);
      for (let i = start; i <= end; i++) list.push(i);
      if (currentPage < pageCount - 2) list.push("…");
      list.push(pageCount);
    }
    return list;
  }, [pageCount, currentPage]);

  async function changeStatus(row: AdminProperty, next: string) {
    if (next === row.status || savingId === row.id) return;
    const prev = row.status;
    // Optimistic update — apply immediately so the row never flickers or the
    // table never blanks while the request is in flight.
    setRows((rs) =>
      rs.map((r) => (r.id === row.id ? { ...r, status: next } : r)),
    );
    setSavingId(row.id);
    try {
      const updated = await adminModerateProperty(row.id, { status: next });
      setRows((rs) =>
        rs.map((r) => (r.id === row.id ? { ...r, status: updated.status } : r)),
      );
      // If a status filter is active and the row no longer matches it, drop it
      // from the current view instead of forcing a full reload.
      if (status && status !== next) {
        setTotal((t) => Math.max(0, t - 1));
        setRows((rs) => rs.filter((r) => r.id !== row.id));
        if (skip > 0 && rows.length <= 1) setSkip(Math.max(0, skip - take));
      }
      toast.success(
        `${row.listingCode} → ${STATUS_LABEL[next] ?? next.replaceAll("_", " ")}`,
      );
    } catch {
      setRows((rs) =>
        rs.map((r) => (r.id === row.id ? { ...r, status: prev } : r)),
      );
      toast.error("Failed to update status");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <PageHeader
        icon="list_alt"
        title="Listings"
        description={`${total} properties — ${status ? (STATUS_LABEL[status] ?? status.replaceAll("_", " ").toLowerCase()) : "all statuses"}`}
      />

      <section className="mt-lg">
        <div className="mb-md flex flex-wrap items-center gap-sm">
          <Input
            placeholder="Search by title, code, or location…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSkip(0);
            }}
            className="w-full max-w-xs bg-surface"
          />
          <div className="flex flex-wrap items-center gap-xs">
            {STATUS_OPTIONS.map((opt) => {
              const active = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setStatus(opt.value);
                    setSkip(0);
                  }}
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
          {loading && rows.length > 0 && (
            <Loader2
              className="size-4 animate-spin text-on-surface-variant"
              aria-hidden="true"
            />
          )}
        </div>

        <AdminDataTable
          minWidth={800}
          columns={["Title", "Type", "Price", "Status", "Owner", "Created"]}
          loading={loading && rows.length === 0}
          busy={loading && rows.length > 0}
          empty={!loading && rows.length === 0}
          emptyMessage="No listings found."
        >
          {rows.map((r) => (
            <AdminDataTable.Row
              key={r.id}
              className="cursor-pointer"
              onClick={() => router.push(`/listings/${r.id}`)}
              title={`Edit ${r.title}`}
            >
              <AdminDataTable.Cell className="whitespace-normal font-medium text-on-surface">
                <Link
                  href={`/listings/${r.id}`}
                  className="underline-offset-2 hover:underline"
                >
                  {r.title}
                </Link>
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="text-on-surface-variant">
                {MAIN_CATEGORY_LABELS[r.mainCategory] ?? r.mainCategory}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="mono-stat text-on-surface">
                {r.askingPrice}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell onClick={(e) => e.stopPropagation()}>
                <Select
                  value={r.status}
                  disabled={savingId === r.id}
                  onValueChange={(v) => changeStatus(r, v)}
                >
                  <SelectTrigger
                    size="sm"
                    aria-busy={savingId === r.id}
                    className="h-7 w-[150px] border-outline-variant text-[11px] font-semibold"
                  >
                    <SelectValue placeholder="Status" />
                    {savingId === r.id && (
                      <Loader2
                        className="size-3.5 animate-spin text-on-surface-variant"
                        aria-hidden="true"
                      />
                    )}
                  </SelectTrigger>
                  <SelectContent align="start">
                    {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              STATUS_DOT[opt.value],
                            )}
                          />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="text-on-surface-variant">
                {r.owner?.name || "—"}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="mono-stat text-[12px] text-on-surface-variant">
                {new Date(r.createdAt).toLocaleDateString()}
              </AdminDataTable.Cell>
            </AdminDataTable.Row>
          ))}
        </AdminDataTable>

        {total > take && (
          <div className="mt-md flex flex-wrap items-center justify-between gap-sm">
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              Showing {skip + 1}–{Math.min(skip + take, total)} of {total}
            </span>
            <div className="flex flex-wrap items-center gap-sm">
              <Select
                value={String(take)}
                onValueChange={(v) => {
                  setTake(Number(v));
                  setSkip(0);
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="h-8 border-outline-variant text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {PAGE_SIZES.map((n) => (
                    <SelectItem key={n} value={String(n)} className="text-xs">
                      {n} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-xs">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={skip === 0}
                  onClick={() => setSkip(Math.max(0, skip - take))}
                >
                  ← Prev
                </Button>
                {pages.map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-1 text-on-surface-variant"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSkip((p - 1) * take)}
                      className={cn(
                        "h-8 min-w-8 rounded-md px-2 font-label-sm mono-stat text-[11px] font-bold transition-colors",
                        p === currentPage
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={skip + take >= total}
                  onClick={() => setSkip(skip + take)}
                >
                  Next →
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
