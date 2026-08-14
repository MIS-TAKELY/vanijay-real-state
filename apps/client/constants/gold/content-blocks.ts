import type { MetalId } from "./metals";

export interface ContentBlock {
  id: string;
  metal: MetalId | "all";
  type: "hero" | "article" | "infographic" | "comparison" | "faq" | "cta";
  order: number;
  title: string;
  subtitle?: string;
  body: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  isPublished: boolean;
  updatedAt: string;
}

export const CONTENT_BLOCKS: ContentBlock[] = [
  // ── Gold Content Blocks ──
  {
    id: "gold-what-affects",
    metal: "gold",
    type: "article",
    order: 1,
    title: "What Affects Gold Prices?",
    subtitle: "Understanding the key drivers of gold valuation",
    body: "Gold prices are influenced by a complex interplay of macroeconomic factors, geopolitical events, and market dynamics. **Central bank policy** plays a pivotal role — when interest rates fall, gold's opportunity cost decreases, making it more attractive. **Inflation expectations** drive demand as investors seek to preserve purchasing power. **US dollar strength** inversely correlates with gold since it's priced in dollars globally. **Geopolitical tensions** trigger safe-haven flows, while **mining supply constraints** and **ETF investment flows** affect physical availability. Understanding these factors helps investors make informed decisions about timing their gold exposure.",
    isPublished: true,
    updatedAt: "2024-08-01T00:00:00Z",
  },
  {
    id: "gold-investment-guide",
    metal: "gold",
    type: "article",
    order: 2,
    title: "Gold Investment Guide",
    subtitle: "Strategies for incorporating gold into your portfolio",
    body: "Gold has served as a store of value for over 5,000 years. Modern investors can access gold through **physical bullion** (bars and coins), **gold ETFs** (like GLD or IAU), **mining stocks** (providing leveraged exposure), and **futures contracts**. Financial advisors typically recommend a 5-15% gold allocation for portfolio diversification. Gold tends to perform best during periods of currency debasement, negative real interest rates, and systemic financial stress. Consider dollar-cost averaging into positions rather than timing the market, and always factor in storage costs and bid-ask spreads when investing in physical gold.",
    isPublished: true,
    updatedAt: "2024-08-01T00:00:00Z",
  },
  {
    id: "gold-purity-guide",
    metal: "gold",
    type: "infographic",
    order: 3,
    title: "Understanding Gold Purity",
    subtitle: "24K vs 22K vs 18K — what you need to know",
    body: "**24K Gold (99.9% pure)** — Used for investment bars and coins. Too soft for everyday jewelry. Bright yellow color.\n\n**22K Gold (91.7% pure)** — Standard for high-quality jewelry in South Asia. Mixed with copper/silver for durability. Traditional choice for wedding jewelry.\n\n**18K Gold (75% pure)** — Popular in Western markets. Excellent balance of purity and durability. Available in yellow, white, and rose variants.\n\n**14K Gold (58.3% pure)** — Most common for everyday wear jewelry in the US. Highly durable with good color retention.",
    isPublished: true,
    updatedAt: "2024-08-01T00:00:00Z",
  },
  // ── Silver Content Blocks ──
  {
    id: "silver-industrial-demand",
    metal: "silver",
    type: "article",
    order: 1,
    title: "Silver's Industrial Revolution",
    subtitle: "How clean energy is transforming silver demand",
    body: "Silver is experiencing an unprecedented demand surge driven by the global energy transition. **Solar photovoltaic cells** consume approximately 100 million ounces annually, with next-generation technologies requiring even more silver per panel. **Electric vehicles** use 2-3x more silver than conventional cars for electrical contacts and battery management systems. **5G infrastructure** relies on silver's superior conductivity for base stations and devices. Industrial demand now exceeds 50% of total silver consumption, creating structural support for prices independent of precious metal sentiment. As governments accelerate net-zero commitments, silver's dual nature as both industrial metal and monetary asset positions it uniquely in the commodities landscape.",
    isPublished: true,
    updatedAt: "2024-08-01T00:00:00Z",
  },
  {
    id: "silver-gold-ratio",
    metal: "silver",
    type: "infographic",
    order: 2,
    title: "The Gold-Silver Ratio Explained",
    subtitle: "A historical perspective on relative valuation",
    body: "The gold-silver ratio measures how many ounces of silver buy one ounce of gold. **Historical average: ~60:1** | **Current range: 75-90:1** | **Ancient Rome: 12:1** | **1980 peak: ~17:1**\n\nWhen the ratio exceeds 80:1, silver is considered undervalued relative to gold. Many traders use extreme readings as contrarian signals, buying silver when the ratio peaks and rotating to gold when it compresses below 50:1. The ratio has been elevated since 2020, suggesting potential mean-reversion opportunity for patient investors.",
    isPublished: true,
    updatedAt: "2024-08-01T00:00:00Z",
  },
  // ── Copper Content Blocks ──
  {
    id: "copper-clean-energy",
    metal: "copper",
    type: "article",
    order: 1,
    title: "Copper: The Metal of Electrification",
    subtitle: "Why copper is critical for the energy transition",
    body: "Copper is the most conductive non-precious metal, making it irreplaceable in the global shift toward electrification. A single **wind turbine** contains up to 8 tons of copper. **Solar farms** require 5 tons per megawatt. **Electric vehicles** use 83kg of copper versus 23kg in conventional cars. **Grid modernization** demands millions of tons for transmission lines and transformers. The International Energy Agency projects copper demand could double by 2040 under net-zero scenarios. However, new mine development takes 10-15 years from discovery to production, creating a looming supply gap that supports long-term price appreciation.",
    isPublished: true,
    updatedAt: "2024-08-01T00:00:00Z",
  },
  // ── Diamond Content Blocks ──
  {
    id: "diamond-4cs",
    metal: "diamond",
    type: "article",
    order: 1,
    title: "Understanding the 4Cs of Diamonds",
    subtitle: "Your complete guide to diamond quality and value",
    body: "Diamond value is determined by four characteristics:\n\n**Carat** — Weight measurement (1 carat = 0.2 grams). Price increases exponentially with size due to rarity.\n\n**Cut** — The most important C for brilliance. Excellent/Ideal cuts maximize light return. Never compromise on cut quality.\n\n**Color** — Graded D (colorless) to Z (light yellow). D-F are premium; G-J offer excellent value with near-colorless appearance.\n\n**Clarity** — Measures internal flaws (inclusions). FL/IF are flawless; VS1-VS2 are eye-clean and represent the best value tier.\n\nAlways insist on GIA or AGS certification for any significant purchase.",
    isPublished: true,
    updatedAt: "2024-08-01T00:00:00Z",
  },
  {
    id: "diamond-lab-vs-natural",
    metal: "diamond",
    type: "comparison",
    order: 2,
    title: "Lab-Grown vs Natural Diamonds",
    subtitle: "Comparing properties, pricing, and value retention",
    body: "| Feature | Natural | Lab-Grown |\n|---------|---------|-----------|\n| Composition | Pure carbon | Pure carbon |\n| Hardness | 10 Mohs | 10 Mohs |\n| Price | Premium | 60-85% less |\n| Rarity | Finite supply | Unlimited production |\n| Resale value | 30-60% of retail | Minimal |\n| Environmental impact | Mining footprint | Energy-intensive growth |\n| Certification | GIA/AGS | IGI/GIA |\n\nLab-grown diamonds are chemically identical to natural stones but lack scarcity-driven value retention. Choose lab for budget-conscious purchases; choose natural for investment-grade stones or heirloom significance.",
    isPublished: true,
    updatedAt: "2024-08-01T00:00:00Z",
  },
  // ── Steel Content Blocks ──
  {
    id: "steel-green-transition",
    metal: "steel",
    type: "article",
    order: 1,
    title: "Green Steel: The Future of Manufacturing",
    subtitle: "How decarbonization is reshaping the steel industry",
    body: "Steel production accounts for approximately 7% of global CO2 emissions. The industry is undergoing a fundamental transformation toward **green steel** produced using hydrogen instead of coking coal. Companies like SSAB, ArcelorMittal, and Tata Steel are investing billions in hydrogen-based direct reduction technology. The EU's Carbon Border Adjustment Mechanism (CBAM) will impose tariffs on carbon-intensive imports starting 2026, creating competitive advantages for low-carbon producers. Green steel currently carries a 20-30% premium, but costs are expected to reach parity by 2035 as renewable energy prices decline and scale increases. Early adopters in automotive and construction are already signing green steel supply agreements.",
    isPublished: true,
    updatedAt: "2024-08-01T00:00:00Z",
  },
  // ── Market Commentary (shared) ──
  {
    id: "market-commentary",
    metal: "all",
    type: "article",
    order: 0,
    title: "Today's Market Commentary",
    subtitle: "Key themes driving precious metals and commodities",
    body: "Global markets are navigating a complex environment shaped by central bank divergence, geopolitical fragmentation, and the accelerating energy transition. Precious metals continue to benefit from de-dollarization trends as emerging market central banks increase gold reserves. Industrial metals face supply constraints amid surging clean energy demand. Monitor upcoming Fed communications and Chinese economic data releases for near-term directional catalysts.",
    isPublished: true,
    updatedAt: "2024-08-14T00:00:00Z",
  },
];

export function getContentBlocksForMetal(metal: MetalId): ContentBlock[] {
  return CONTENT_BLOCKS.filter(
    (block) =>
      block.isPublished && (block.metal === metal || block.metal === "all"),
  ).sort((a, b) => a.order - b.order);
}
