"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  CurrencyCode,
  MetalId,
  WeightUnit,
} from "../../constants/gold/metals";
import { METAL_META, METALS_DATA } from "../../constants/gold/metals";
import { METAL_FAQS } from "../../constants/gold/faq-data";
import type { ContentBlock } from "../../constants/gold/content-blocks";
import { useContentStore } from "store/content";
import { useLiveMetalPrices } from "../../hooks/use-live-metal-prices";
import type { FenegosidaTodayRate } from "lib/fenegosida";
import { Breadcrumb } from "./Breadcrumb";
import { HeroPricePanel } from "./HeroPricePanel";
import { MarketOverview } from "./MarketOverview";
import { PriceHistoryChart } from "./PriceHistoryChart";
import { PriceConverter } from "./PriceConverter";
import { AnalyticsGrid } from "./AnalyticsGrid";
import { ContentBlockRenderer } from "./ContentBlockRenderer";
import { FAQAccordion } from "./FAQAccordion";
import { HistoricalTable } from "./HistoricalTable";

interface MetalPageTemplateProps {
  metalId: MetalId;
  /** Official Fenegosida NPR rate for the hero "Today's Price" (gold/silver only). */
  todayRate?: FenegosidaTodayRate | null;
}

export function MetalPageTemplate({
  metalId,
  todayRate,
}: MetalPageTemplateProps) {
  const { metals, loading, error, lastUpdated } = useLiveMetalPrices();
  const [currency, setCurrency] = useState<CurrencyCode>("NPR");
  const [unit, setUnit] = useState<WeightUnit>("tola");

  const activeMetal = useMemo(() => {
    const found = metals.find((m) => m.id === metalId);
    return found ?? METALS_DATA.find((m) => m.id === metalId) ?? metals[0]!;
  }, [metals, metalId]);

  const allContentBlocks = useContentStore((s) => s.contentBlocks);
  const contentBlocks = useMemo(
    () =>
      allContentBlocks
        .filter(
          (block: ContentBlock) =>
            block.isPublished &&
            (block.metal === metalId || block.metal === "all"),
        )
        .sort((a, b) => a.order - b.order),
    [allContentBlocks, metalId],
  );
  const faqs = METAL_FAQS[metalId] ?? [];
  const meta = METAL_META[metalId];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Metals", href: "/gold" },
    { label: meta?.name ?? metalId },
  ];

  return (
    <main className="flex flex-col gap-0">
      <div className="mx-auto w-full max-w-[1280px] px-6 pt-8 pb-6 md:pt-12 md:pb-10">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Hero Section: Today's Price + unit/currency choosers + market overview */}
        <section className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
          <HeroPricePanel
            metal={activeMetal}
            currency={currency}
            onCurrencyChange={setCurrency}
            unit={unit}
            onUnitChange={setUnit}
            todayRate={todayRate}
          />
          <MarketOverview
            metals={metals}
            activeId={metalId}
            currency={currency}
          />
        </section>

        {/* Full-width Price History chart (lightweight-charts + gold-api.com) */}
        <div className="mb-10">
          <PriceHistoryChart metal={activeMetal} currency={currency} />
        </div>

        {/* Error banner — surfaced near the top so users see it immediately */}
        {error && (
          <div
            className="mb-10 rounded-lg border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm text-red-600"
            role="alert"
          >
            Live feed unavailable — showing cached quotes. {error}
          </div>
        )}

        {/* Divider */}
        <div className="mb-10 h-px w-full bg-outline-variant" />

        {/* Price Converter */}
        <div className="mb-10">
          <PriceConverter
            metal={activeMetal}
            currency={currency}
            defaultUnit={unit}
          />
        </div>

        {/* Analytics Grid */}
        <div className="mb-10">
          <AnalyticsGrid metal={activeMetal} currency={currency} />
        </div>

        {/* Divider */}
        <div className="mb-10 h-px w-full bg-outline-variant" />

        {/* Content Blocks (Admin-managed) */}
        {contentBlocks.length > 0 && (
          <div className="mb-10">
            <ContentBlockRenderer blocks={contentBlocks} />
          </div>
        )}

        {/* Divider */}
        <div className="mb-10 h-px w-full bg-outline-variant" />

        {/* Historical Data Table */}
        <div className="mb-10">
          <HistoricalTable metal={activeMetal} currency={currency} />
        </div>

        {/* Divider */}
        <div className="mb-10 h-px w-full bg-outline-variant" />

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <div className="mb-10">
            <FAQAccordion items={faqs} metalName={meta?.name ?? metalId} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="border-t border-outline-variant py-8 text-center text-xs text-on-surface-variant/70"
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
          Malpoth Precious Metals &copy; {new Date().getFullYear()}
        </p>
        <p className="mt-3">
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-xs text-on-surface-variant shadow-sm transition-colors hover:border-gold/40 hover:text-primary"
          >
            <Settings2 size={13} aria-hidden="true" />
            Content admin
          </Link>
        </p>
      </footer>
    </main>
  );
}
