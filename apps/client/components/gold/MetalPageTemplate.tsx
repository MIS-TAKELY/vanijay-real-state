"use client";

import { useMemo, useState } from "react";
import type { CurrencyCode, MetalId, WeightUnit } from "../../constants/gold/metals";
import { METAL_META, METALS_DATA } from "../../constants/gold/metals";
import { METAL_FAQS } from "../../constants/gold/faq-data";
import { getContentBlocksForMetal } from "../../constants/gold/content-blocks";
import { useLiveMetalPrices } from "../../hooks/use-live-metal-prices";
import { Breadcrumb } from "./Breadcrumb";
import { HeroPricePanel } from "./HeroPricePanel";
import { MetalChart } from "./MetalChart";
import { PriceConverter } from "./PriceConverter";
import { AnalyticsGrid } from "./AnalyticsGrid";
import { ContentBlockRenderer } from "./ContentBlockRenderer";
import { FAQAccordion } from "./FAQAccordion";
import { HistoricalTable } from "./HistoricalTable";
import { CurrencyToggle } from "./CurrencyToggle";
import { UnitToggle } from "./UnitToggle";
import { TickerRibbon } from "./TickerRibbon";

interface MetalPageTemplateProps {
  metalId: MetalId;
}

export function MetalPageTemplate({ metalId }: MetalPageTemplateProps) {
  const { metals, loading, error, lastUpdated } = useLiveMetalPrices();
  const [currency, setCurrency] = useState<CurrencyCode>("NPR");
  const [unit, setUnit] = useState<WeightUnit>("oz");
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1M");

  const activeMetal = useMemo(() => {
    const found = metals.find((m) => m.id === metalId);
    return found ?? METALS_DATA.find((m) => m.id === metalId) ?? metals[0]!;
  }, [metals, metalId]);

  const contentBlocks = useMemo(() => getContentBlocksForMetal(metalId), [metalId]);
  const faqs = METAL_FAQS[metalId] ?? [];
  const meta = METAL_META[metalId];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Metals", href: "/gold" },
    { label: meta?.name ?? metalId },
  ];

  return (
    <main className="flex flex-col gap-0">
      {/* Live Ticker Ribbon — clicking any metal navigates to its page */}
      <TickerRibbon
        metals={metals}
        currency={currency}
        activeId={metalId}
      />

      <div className="mx-auto w-full max-w-[1280px] px-6 pt-8 pb-6 md:pt-12 md:pb-10">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header with toggles */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: meta?.accentColor }}
                aria-hidden="true"
              />
              <h1
                className="text-3xl font-semibold tracking-tight text-[#E8E6E1] md:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {meta?.name} Price Today
              </h1>
              {/* Live badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#34D399]/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#34D399]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" aria-hidden="true" />
                Live
              </span>
            </div>
            <p className="text-sm text-white/40" style={{ fontFamily: "var(--font-body)" }}>
              Track real-time {meta?.name.toLowerCase()} rates per {unit} in {currency}
              {lastUpdated && (
                <time dateTime={lastUpdated.toISOString()} className="ml-2 text-white/25">
                  · Updated {lastUpdated.toLocaleTimeString()}
                </time>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CurrencyToggle currency={currency} onCurrencyChange={setCurrency} />
            <UnitToggle unit={unit} onUnitChange={setUnit} />
          </div>
        </div>

        {/* Hero Section: Price Panel + Chart */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr] mb-10">
          <HeroPricePanel
            metal={activeMetal}
            metals={metals}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
          <MetalChart
            metal={activeMetal}
            currency={currency}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06] mb-10" />

        {/* Price Converter */}
        <div className="mb-10">
          <PriceConverter metal={activeMetal} currency={currency} defaultUnit={unit} />
        </div>

        {/* Analytics Grid */}
        <div className="mb-10">
          <AnalyticsGrid metal={activeMetal} currency={currency} />
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06] mb-10" />

        {/* Content Blocks (Admin-managed) */}
        {contentBlocks.length > 0 && (
          <div className="mb-10">
            <ContentBlockRenderer blocks={contentBlocks} />
          </div>
        )}

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06] mb-10" />

        {/* Historical Data Table */}
        <div className="mb-10">
          <HistoricalTable metal={activeMetal} currency={currency} />
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06] mb-10" />

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <div className="mb-10">
            <FAQAccordion items={faqs} metalName={meta?.name ?? metalId} />
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="rounded-lg border border-[#F87171]/20 bg-[#F87171]/5 px-4 py-3 text-sm text-[#F87171]" role="alert">
            Live feed unavailable — showing cached quotes. {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="border-t border-white/[0.06] py-8 text-center text-xs text-white/40"
        style={{ fontFamily: "var(--font-body)" }}
      >
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
