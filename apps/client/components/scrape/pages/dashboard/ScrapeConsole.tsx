"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Search, Settings2 } from "lucide-react";
import {
  findCategory,
  HAMROBAZAAR_DEFAULT_CATEGORY,
  HAMROBAZAAR_REAL_ESTATE_CATEGORIES,
} from "lib/scrape/categories";
import type { ScrapeResult } from "lib/scrape/hamrobazaar";
import { StatChips } from "./StatChips";
import { StatusLog, type LogLine } from "./StatusLog";
import { ResultList } from "./ResultList";

const PAGE_SIZES = [12, 24, 36];

function timestamp(): string {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function initialState(): ScrapeResult {
  return {
    source: "sample",
    usedFallback: false,
    items: [],
    totalRecords: 0,
    page: 1,
    pageSize: 12,
    fetchedAt: new Date().toISOString(),
    durationMs: 0,
  };
}

export function ScrapeConsole() {
  const [categoryId, setCategoryId] = useState(HAMROBAZAAR_DEFAULT_CATEGORY.id);
  const [keyword, setKeyword] = useState("");
  const [pageSize, setPageSize] = useState(12);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult>(initialState);
  const [log, setLog] = useState<LogLine[]>([]);

  const runIdRef = useRef(0);

  const pushLog = (text: string, tone: LogLine["tone"] = "info") => {
    setLog((prev) => [...prev, { time: timestamp(), text, tone }]);
  };

  const runScrape = async (opts?: { silent?: boolean }) => {
    const runId = ++runIdRef.current;
    setLoading(true);
    if (!opts?.silent) {
      setLog([
        {
          time: timestamp(),
          text: "· new scrape run",
          tone: "muted",
        },
      ]);
    }

    const category = findCategory(categoryId);
    const categoryLabel = category?.name ?? "All Real Estate";
    const query = new URLSearchParams({
      categoryId,
      pageSize: String(pageSize),
    });
    if (keyword.trim()) query.set("keyword", keyword.trim());

    pushLog(`› resolving category: ${categoryLabel}`);
    pushLog(
      `› GET /api/scrape/hamrobazaar?${query.toString().replaceAll("&", " ")}`,
    );
    pushLog("› waiting for hamrobazaar.com/api/products/list/latest…");

    try {
      const res = await fetch(`/api/scrape/hamrobazaar?${query.toString()}`);
      const data = (await res.json()) as ScrapeResult;

      if (runId !== runIdRef.current) return; // a newer run superseded this one

      if (data.usedFallback) {
        pushLog(`! live fetch failed — ${data.error ?? "unknown"}`, "warn");
        pushLog("· serving sample dataset as fallback", "muted");
      } else {
        pushLog(
          `✓ received ${data.items.length}/${data.totalRecords} listings`,
          "ok",
        );
      }
      pushLog(
        "· normalized devanagari digits (०-९→0-9) · prices formatted in NPR",
        "muted",
      );
      pushLog(`✓ done in ${data.durationMs} ms`, "ok");

      setResult(data);
    } catch (err) {
      if (runId !== runIdRef.current) return;
      pushLog(
        `✗ request failed — ${err instanceof Error ? err.message : "network error"}`,
        "warn",
      );
    } finally {
      if (runId === runIdRef.current) setLoading(false);
    }
  };

  // Initial load: scrape the default category so the dashboard is live on arrival.
  useEffect(() => {
    void runScrape({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Control panel */}
      <div className="rounded-xl border border-scrape-border bg-scrape-surface p-5">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-scrape-primary" />
          <h2 className="font-scrape-mono text-sm uppercase tracking-wider text-scrape-on-bg">
            Scrape configuration
          </h2>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr_auto_auto]">
          {/* Category */}
          <label className="block">
            <span className="font-scrape-mono text-[11px] uppercase tracking-wider text-scrape-muted">
              Category
            </span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1.5 w-full cursor-pointer rounded-lg border border-scrape-border bg-scrape-surface-2 px-3 py-2.5 text-sm text-scrape-on-bg outline-none transition-colors focus:border-scrape-primary"
            >
              {HAMROBAZAAR_REAL_ESTATE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          {/* Keyword */}
          <label className="block">
            <span className="font-scrape-mono text-[11px] uppercase tracking-wider text-scrape-muted">
              Keyword
            </span>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-scrape-muted" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void runScrape()}
                placeholder="e.g. land, apartment, baluwatar…"
                className="w-full rounded-lg border border-scrape-border bg-scrape-surface-2 py-2.5 pl-9 pr-3 text-sm text-scrape-on-bg placeholder:text-scrape-muted outline-none transition-colors focus:border-scrape-primary"
              />
            </div>
          </label>

          {/* Page size */}
          <label className="block">
            <span className="font-scrape-mono text-[11px] uppercase tracking-wider text-scrape-muted">
              Page size
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="mt-1.5 w-full cursor-pointer rounded-lg border border-scrape-border bg-scrape-surface-2 px-3 py-2.5 text-sm text-scrape-on-bg outline-none transition-colors focus:border-scrape-primary"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} items
                </option>
              ))}
            </select>
          </label>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => void runScrape()}
              disabled={loading}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-scrape-primary px-5 py-2.5 text-sm font-semibold text-[#0a0e16] transition-all hover:bg-scrape-cyan hover:shadow-[0_0_24px_rgba(34,211,238,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              {loading ? "Scraping…" : "Run scrape"}
            </button>
            <button
              type="button"
              onClick={() => void runScrape()}
              disabled={loading}
              aria-label="Re-run scrape"
              title="Re-run scrape"
              className="inline-flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-lg border border-scrape-border bg-scrape-surface-2 text-scrape-muted transition-colors hover:border-scrape-primary/40 hover:text-scrape-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status log */}
      <StatusLog lines={log} running={loading} />

      {/* Stats */}
      {result.items.length > 0 && <StatChips result={result} />}

      {/* Results */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-scrape-mono text-sm uppercase tracking-wider text-scrape-on-bg">
            Results
          </h2>
          <span
            className={`rounded-md border px-2 py-0.5 font-scrape-mono text-[11px] ${
              result.usedFallback
                ? "border-scrape-warning/30 bg-scrape-warning/10 text-scrape-warning"
                : "border-scrape-success/30 bg-scrape-success/10 text-scrape-success"
            }`}
          >
            {result.usedFallback ? "SAMPLE DATA" : "LIVE DATA"}
          </span>
        </div>
        <ResultList items={result.items} />
      </div>
    </div>
  );
}
