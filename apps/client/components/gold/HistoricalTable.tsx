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

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface shadow-sm">
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