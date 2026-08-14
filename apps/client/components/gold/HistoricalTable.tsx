"use client";

import { useMemo } from "react";
import type { CurrencyCode, MetalData } from "../../constants/gold/metals";
import { formatChange, formatPrice, getHistoricalData } from "../../constants/gold/metals";

interface HistoricalTableProps {
  metal: MetalData;
  currency: CurrencyCode;
}

export function HistoricalTable({ metal, currency }: HistoricalTableProps) {
  const anchorPrice =
    currency === "USD" ? metal.usdPrice : metal.price;
  const rows = useMemo(
    () => getHistoricalData(anchorPrice),
    [anchorPrice],
  );

  return (
    <div>
      <h2
        className="mb-6 text-2xl font-medium tracking-tight md:text-3xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Historical Data
        <span className="ml-3 text-base font-normal text-white/30">
          {metal.name} ({metal.symbol})
        </span>
      </h2>

      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#1A1D23]">
        <table
          className="w-full text-left"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <thead>
            <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-white/30">
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
                  className="border-b border-white/[0.04] text-sm transition-colors last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="whitespace-nowrap px-5 py-3 text-white/60">
                    {row.date}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-white/70">
                    {formatPrice(row.open, currency)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-white/70">
                    {formatPrice(row.high, currency)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-white/70">
                    {formatPrice(row.low, currency)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-[#E8E6E1]">
                    {formatPrice(row.close, currency)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-5 py-3 text-right font-medium ${isUp ? "text-[#34D399]" : "text-[#F87171]"}`}
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
        className="mt-3 text-xs text-white/25"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Showing last 14 trading days. Prices in {currency} per {metal.unit}.
      </p>
    </div>
  );
}
