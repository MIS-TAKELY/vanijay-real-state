"use client";

import { useMemo, useState } from "react";
import { HeroPricePanel } from "../../../components/gold/HeroPricePanel";
import { HistoricalTable } from "../../../components/gold/HistoricalTable";
import { MetalCardGrid } from "../../../components/gold/MetalCardGrid";
import { MetalChart } from "../../../components/gold/MetalChart";
import { TickerRibbon } from "../../../components/gold/TickerRibbon";
import { useLiveMetalPrices } from "../../../hooks/use-live-metal-prices";
import type { CurrencyCode, MetalId } from "../../../constants/gold/metals";

export default function PreciousMetalsPage() {
  const { metals, loading, error, lastUpdated } = useLiveMetalPrices();
  const [selectedMetal, setSelectedMetal] = useState<MetalId>("gold");
  const [currency, setCurrency] = useState<CurrencyCode>("NPR");
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">(
    "1M",
  );

  const activeMetal = useMemo(() => {
    const found = metals.find((m) => m.id === selectedMetal);
    return found ?? metals[0]!;
  }, [metals, selectedMetal]);

  return (
    <main className="flex flex-col gap-0">
      {/* Signature: Live Ticker Ribbon */}
      <TickerRibbon
        metals={metals}
        currency={currency}
        onSelect={setSelectedMetal}
        activeId={selectedMetal}
      />

      {/* Hero Section: Featured Metal + Chart */}
      <section className="mx-auto w-full max-w-[1280px] px-6 pt-10 pb-6 md:pt-14 md:pb-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
          <HeroPricePanel
            metal={activeMetal}
            metals={metals}
            currency={currency}
            onCurrencyChange={setCurrency}
            onMetalChange={setSelectedMetal}
          />
          <MetalChart
            metal={activeMetal}
            currency={currency}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-[1280px] px-6">
        <div className="h-px w-full bg-white/[0.06]" />
      </div>

      {/* All Metals Grid */}
      <section className="mx-auto w-full max-w-[1280px] px-6 py-10 md:py-14">
        <h2
          className="mb-8 text-2xl font-medium tracking-tight md:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Market Overview
        </h2>
        <MetalCardGrid
          metals={metals}
          activeId={selectedMetal}
          currency={currency}
          onSelect={setSelectedMetal}
        />
      </section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-[1280px] px-6">
        <div className="h-px w-full bg-white/[0.06]" />
      </div>

      {/* Historical Data Table */}
      <section className="mx-auto w-full max-w-[1280px] px-6 py-10 md:py-14">
        <HistoricalTable metal={activeMetal} currency={currency} />
      </section>

      {/* Footer */}
      <footer
        className="border-t border-white/[0.06] py-8 text-center text-xs text-white/40"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {error && (
          <p className="mb-1 text-[#F87171]">
            Live feed unavailable — showing cached quotes. {error}
          </p>
        )}
        <p className={loading ? "price-live" : ""}>
          Live {currency} rates from freegoldprice.org &amp; gold-api.com
          {lastUpdated
            ? ` · updated ${lastUpdated.toLocaleTimeString()}`
            : " · connecting…"}
        </p>
        <p className="mt-1">
          Prices are indicative and delayed. Not financial advice.
        </p>
        <p className="mt-1">
          Vanijay Precious Metals &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
