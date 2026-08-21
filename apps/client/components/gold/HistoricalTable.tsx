"use client";

import { useMemo } from "react";
import type { CurrencyCode, MetalData } from "../../constants/gold/metals";
import {
  formatChange,
  formatPrice,
  getHistoricalData,
  priceInCurrency,
} from "../../constants/gold/metals";

interface HistoricalTableProps {
  metal: MetalData;
  currency: CurrencyCode;
}

export function HistoricalTable({ metal, currency }: HistoricalTableProps) {
  const anchorPrice = priceInCurrency(metal, currency);
  const rows = useMemo(() => getHistoricalData(anchorPrice), [anchorPrice]);

  return (
    <div>
      <h2
        className="mb-6 text-2xl font-medium tracking-tight text-on-surface md:text-3xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Historical Data
        <span className="ml-3 text-base font-normal text-on-surface-variant">
          {metal.name} ({metal.symbol})
        </span>
      </h2>

      {/* Mobile: card layout */}
      <div className="grid gap-2 md:hidden">
        {rows.map((row, i) => {
          const isUp = row.change >= 0;
          return (
            <div
              key={i}
              className="rounded-xl border border-outline-variant bg-surface p-3 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="text-xs text-on-surface-variant"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {row.date}
                </span>
                <span
                  className={`text-xs font-medium tabular-nums ${isUp ? "text-emerald-600" : "text-red-600"}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatChange(row.change)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Open</span>
                  <span className="tabular-nums text-on-surface-variant">{formatPrice(row.open, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Close</span>
                  <span className="font-medium tabular-nums text-on-surface">{formatPrice(row.close, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">High</span>
                  <span className="tabular-nums text-on-surface-variant">{formatPrice(row.high, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Low</span>
                  <span className="tabular-nums text-on-surface-variant">{formatPrice(row.low, currency)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table layout */}
      <div className="hidden overflow-x-auto rounded-xl border border-outline-variant bg-surface shadow-sm md:block">
        <table
          className="w-full text-left"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <thead>
            <tr className="border-b border-outline-variant text-xs uppercase tracking-wider text-on-surface-variant">
              <th
                className="px-5 py-3 font-medium"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Date
              </th>
              <th
                className="px-5 py-3 text-right font-medium"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Open
              </th>
              <th
                className="px-5 py-3 text-right font-medium"
                style={{ fontFamily: "var(--font-body)" }}
              >
                High
              </th>
              <th
                className="px-5 py-3 text-right font-medium"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Low
              </th>
              <th
                className="px-5 py-3 text-right font-medium"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Close
              </th>
              <th
                className="px-5 py-3 text-right font-medium"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isUp = row.change >= 0;
              return (
                <tr
                  key={i}
                  className="border-b border-outline-variant/60 text-sm tabular-nums transition-colors last:border-0 hover:bg-surface-container/60"
                >
                  <td className="whitespace-nowrap px-5 py-3 text-on-surface-variant">
                    {row.date}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-on-surface-variant">
                    {formatPrice(row.open, currency)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-on-surface-variant">
                    {formatPrice(row.high, currency)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-on-surface-variant">
                    {formatPrice(row.low, currency)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-on-surface">
                    {formatPrice(row.close, currency)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-5 py-3 text-right font-medium ${isUp ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {formatChange(row.change)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p
        className="mt-3 text-xs text-on-surface-variant/70"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Showing last 14 trading days. Prices in {currency} per {metal.unit}.
      </p>
    </div>
  );
}