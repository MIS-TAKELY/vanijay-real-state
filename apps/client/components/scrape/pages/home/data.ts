/**
 * Research-backed dataset powering the static Scrape Intelligence page.
 * Compiled from an analysis of the global web-scraping tooling landscape
 * (2025–2026) mapped against Nepal's real-world data sources.
 */

/* ------------------------------------------------------------------ */
/* Global tooling landscape                                            */
/* ------------------------------------------------------------------ */

export type ToolCategory =
  | "Open-Source"
  | "Browser Automation"
  | "No-Code"
  | "Scraping API"
  | "AI-Native";

export interface GlobalTool {
  name: string;
  category: ToolCategory;
  origin: string;
  pricing: string;
  bestFor: string;
  barrier: "Low" | "Medium" | "High";
  note: string;
}

export const GLOBAL_TOOLS: GlobalTool[] = [
  {
    name: "Scrapy",
    category: "Open-Source",
    origin: "Python",
    pricing: "Free · self-hosted",
    bestFor: "Large-scale concurrent crawling pipelines",
    barrier: "High",
    note: "The industry classic — async Twisted engine, middleware ecosystem, item pipelines. Overkill for quick jobs, unbeatable at depth.",
  },
  {
    name: "Crawlee",
    category: "Open-Source",
    origin: "Node / Python",
    pricing: "Free · AGPL",
    bestFor: "Production crawlers with anti-block resilience",
    barrier: "High",
    note: "Apify's SDK. Built-in queues, session rotation, proxy management and auto-retry — the modern default for custom crawlers.",
  },
  {
    name: "Playwright",
    category: "Browser Automation",
    origin: "Microsoft",
    pricing: "Free",
    bestFor: "SPAs, infinite scroll, login flows, screenshots",
    barrier: "High",
    note: "Drives real Chromium/WebKit/Firefox. Essential for JavaScript-rendered listings and anything behind a click-flow.",
  },
  {
    name: "Puppeteer",
    category: "Browser Automation",
    origin: "Google",
    pricing: "Free",
    bestFor: "Headless Chrome control in Node",
    barrier: "High",
    note: "The original headless-Chrome library. Playwright has largely superseded it, but it remains everywhere in legacy pipelines.",
  },
  {
    name: "BeautifulSoup",
    category: "Open-Source",
    origin: "Python",
    pricing: "Free",
    bestFor: "Fast parsing of static server-rendered HTML",
    barrier: "Low",
    note: "Parses only — no fetching, no JS. Pair with requests + retries for simple static targets.",
  },
  {
    name: "Cheerio",
    category: "Open-Source",
    origin: "Node",
    pricing: "Free",
    bestFor: "jQuery-style parsing in Node pipelines",
    barrier: "Low",
    note: "Server-side jQuery. Blazing fast for static pages already fetched by axios/undici.",
  },
  {
    name: "Octoparse",
    category: "No-Code",
    origin: "USA",
    pricing: "Free tier · from $69/mo",
    bestFor: "Point-and-click extraction by non-developers",
    barrier: "Low",
    note: "Visual element-highlighting workflow, cloud scheduling, pagination wizards. Fine for occasional, human-operated runs.",
  },
  {
    name: "ParseHub",
    category: "No-Code",
    origin: "Canada",
    pricing: "Free tier · from $189/mo",
    bestFor: "Visual scraping with JS rendering, API export",
    barrier: "Low",
    note: "Cloud-rendered visual scraper with a JSON/REST API output — a middle path between no-code and code-first.",
  },
  {
    name: "Apify",
    category: "Scraping API",
    origin: "Czechia",
    pricing: "Free tier · from $29/mo",
    bestFor: "Pre-built actors + serverless orchestration",
    barrier: "Medium",
    note: "Thousands of community 'Actors' for major sites, cloud scheduling, storage and proxy rotation in one platform.",
  },
  {
    name: "Zyte",
    category: "Scraping API",
    origin: "Ireland",
    pricing: "PAYG · from $0.13/1k requests",
    bestFor: "Managed crawling with tiered anti-bot pricing",
    barrier: "Medium",
    note: "Formerly Scrapinghub. Smart auto-bypass priced by difficulty tier — simple pages stay cheap.",
  },
  {
    name: "Bright Data",
    category: "Scraping API",
    origin: "Israel / USA",
    pricing: "PAYG · from $4/GB · plans $499+/mo",
    bestFor: "Enterprise-scale proxy networks & Web Unlocker",
    barrier: "Medium",
    note: "400M+ residential IPs across 195 countries. The heavyweight for heavily guarded, high-volume targets.",
  },
  {
    name: "ScraperAPI",
    category: "Scraping API",
    origin: "USA",
    pricing: "Free tier · from $49/mo",
    bestFor: "Proxy rotation + JS rendering behind one key",
    barrier: "Medium",
    note: "Drop-in REST proxy with retries, headers and geo-targeting. A quick win for existing scripts that keep getting blocked.",
  },
  {
    name: "ScrapingBee",
    category: "Scraping API",
    origin: "France",
    pricing: "Free tier · from $49/mo",
    bestFor: "Headless-browser rendering as a service",
    barrier: "Medium",
    note: "Chrome-rendered responses with CAPTCHA solving built in — reliable for JS-heavy pages without running a browser farm.",
  },
  {
    name: "Firecrawl",
    category: "AI-Native",
    origin: "USA",
    pricing: "Free tier · from $16/mo",
    bestFor: "LLM-ready Markdown/JSON for RAG pipelines",
    barrier: "Low",
    note: "Scrape, crawl and search in one API that returns clean Markdown — the current favourite for feeding AI agents and vector stores.",
  },
  {
    name: "Diffbot",
    category: "AI-Native",
    origin: "USA",
    pricing: "Plans · from $295/mo",
    bestFor: "Structured entity extraction (products, articles)",
    barrier: "Low",
    note: "Computer-vision parsing into typed ontologies — no selectors to maintain, at a premium price.",
  },
];

export const TOOL_CATEGORIES: {
  id: ToolCategory;
  tagline: string;
  icon: string;
}[] = [
  {
    id: "Open-Source",
    tagline: "Libraries & frameworks you run yourself — zero platform fees, total control.",
    icon: "code",
  },
  {
    id: "Browser Automation",
    tagline: "Real browsers that render JS, click, scroll and authenticate like a human.",
    icon: "monitor",
  },
  {
    id: "No-Code",
    tagline: "Visual point-and-click extractors for analysts who never write a selector.",
    icon: "mouse",
  },
  {
    id: "Scraping API",
    tagline: "Managed proxies, rendering and anti-bot bypass behind a single REST key.",
    icon: "cloud",
  },
  {
    id: "AI-Native",
    tagline: "APIs that return LLM-ready Markdown and typed entities — no DOM parsing.",
    icon: "sparkles",
  },
];

export const LANDSCAPE_STATS = [
  { value: "15", label: "Tools profiled" },
  { value: "5", label: "Tool categories" },
  { value: "9", label: "Nepal sources mapped" },
  { value: "4", label: "Anti-bot stacks decoded" },
];

/* ------------------------------------------------------------------ */
/* Nepal data landscape                                                */
/* ------------------------------------------------------------------ */

export type NepalSector = "Real Estate" | "E-Commerce" | "Jobs";

export interface NepalSource {
  name: string;
  domain: string;
  sector: NepalSector;
  difficulty: 1 | 2 | 3 | 4 | 5;
  antiBot: string;
  value: string;
  targets: string[];
}

export const NEPAL_SOURCES: NepalSource[] = [
  {
    name: "Hamrobazaar",
    domain: "hamrobazaar.com",
    sector: "Real Estate",
    difficulty: 3,
    antiBot: "Custom rate limiting · 403 on rapid bursts",
    value: "Nepal's largest classifieds — millions of P2P & agent listings.",
    targets: [
      "Prices in Aana / Ropani / Dhur",
      "Location + seller contacts",
      "Residential & commercial mix",
    ],
  },
  {
    name: "Nepal Homes",
    domain: "nepalhomes.com",
    sector: "Real Estate",
    difficulty: 2,
    antiBot: "Light protection",
    value: "Data-tech marketplace with verified listings and agency portfolios.",
    targets: [
      "Verified property pricing trends",
      "Neighbourhood amenities",
      "Agency inventory",
    ],
  },
  {
    name: "Gharghaderi",
    domain: "gharghaderi.com",
    sector: "Real Estate",
    difficulty: 1,
    antiBot: "Minimal",
    value: "Long-standing portal for land plots, houses and apartments.",
    targets: [
      "Plot sizes & price per Aana",
      "Property IDs",
      "Direct owner / agent contacts",
    ],
  },
  {
    name: "Gharbazar",
    domain: "gharbazar.com",
    sector: "Real Estate",
    difficulty: 1,
    antiBot: "Minimal",
    value: "Property portal with rich neighbourhood metrics around each listing.",
    targets: [
      "School / hospital proximity scores",
      "Standard pricing",
      "Neighbourhood walkability",
    ],
  },
  {
    name: "Daraz Nepal",
    domain: "daraz.com.np",
    sector: "E-Commerce",
    difficulty: 5,
    antiBot: "Alibaba ARES anti-bot stack",
    value: "Alibaba-owned e-commerce titan — millions of SKUs and reviews.",
    targets: [
      "Product price history",
      "Seller ratings & stock",
      "Category taxonomies",
    ],
  },
  {
    name: "SastoDeal",
    domain: "sastodeal.com",
    sector: "E-Commerce",
    difficulty: 3,
    antiBot: "Cloudflare JS challenge",
    value: "Domestic e-commerce benchmark for local retail pricing.",
    targets: [
      "Local retail price indices",
      "Promotions & discounts",
      "Consumer demand signals",
    ],
  },
  {
    name: "Thulo.com",
    domain: "thulo.com",
    sector: "E-Commerce",
    difficulty: 2,
    antiBot: "Light protection",
    value: "Multi-vendor marketplace — a clean proxy for domestic demand.",
    targets: [
      "Multi-vendor catalogues",
      "Shopper sentiment",
      "Category growth",
    ],
  },
  {
    name: "Merojob",
    domain: "merojob.com",
    sector: "Jobs",
    difficulty: 4,
    antiBot: "AWS WAF + behavioural rate limiting",
    value: "Nepal's leading recruitment portal since 2009.",
    targets: [
      "Job titles & skills demand",
      "Salary brackets where listed",
      "Hiring volumes by industry",
    ],
  },
  {
    name: "JobsNepal",
    domain: "jobsnepal.com",
    sector: "Jobs",
    difficulty: 2,
    antiBot: "Minimal",
    value: "One of Nepal's oldest job boards, rich in historical vacancy data.",
    targets: [
      "Historical hiring records",
      "Sector distribution",
      "Employer profiles",
    ],
  },
];

export const NEPAL_SECTORS: { id: NepalSector | "All"; icon: string }[] = [
  { id: "All", icon: "layers" },
  { id: "Real Estate", icon: "domain" },
  { id: "E-Commerce", icon: "storefront" },
  { id: "Jobs", icon: "search" },
];

/* ------------------------------------------------------------------ */
/* Anti-bot & localization challenges                                  */
/* ------------------------------------------------------------------ */

export interface Challenge {
  stack: string;
  icon: string;
  color: string;
  target: string;
  detail: string;
}

export const ANTI_BOT_STACKS: Challenge[] = [
  {
    stack: "Alibaba ARES",
    icon: "shield",
    color: "text-scrape-danger",
    target: "Daraz Nepal",
    detail:
      "The same fingerprinting & TLS validation stack used across Lazada and Daraz PK/BD. Plain requests with generic headers are dropped immediately — you need real browser fingerprints and session continuity.",
  },
  {
    stack: "AWS WAF",
    icon: "cloud",
    color: "text-scrape-warning",
    target: "Merojob",
    detail:
      "Rate thresholds per IP window plus behavioural analysis tuned to catch automated bursts. Sustained polite crawling from clean IPs passes; hammering does not.",
  },
  {
    stack: "Cloudflare",
    icon: "zap",
    color: "text-scrape-cyan",
    target: "SastoDeal + news/classifieds",
    detail:
      "Moderate-to-strict JS challenges, TLS fingerprint checks and occasional Turnstile CAPTCHAs. A headless browser or a solver-backed proxy is often required.",
  },
  {
    stack: "Custom rate limiting",
    icon: "speed",
    color: "text-scrape-success",
    target: "Hamrobazaar",
    detail:
      "Pattern-based detection on rapid-fire request sequences from datacenter IPs. Immediate 403s or CAPTCHA triggers — pacing and residential IPs matter more than clever parsing.",
  },
];

export const LOCALIZATION_QUIRKS: {
  icon: string;
  title: string;
  detail: string;
}[] = [
  {
    icon: "numbers",
    title: "Dual numeral systems",
    detail:
      "Pages mix Arabic (0–9) and Devanagari numerals (०१२३४५६७८९). Normalize both before storing prices — a single ५ vs 5 swap corrupts an entire price series.",
  },
  {
    icon: "calendar",
    title: "Bikram Sambat dates",
    detail:
      "Listings on government-adjacent and traditional portals use the BS calendar — roughly 57 years ahead of the Gregorian calendar. Convert to ISO dates at parse time.",
  },
  {
    icon: "translate",
    title: "Mixed-script UTF-8",
    detail:
      "Descriptions interleave Devanagari script with Latin characters and English loanwords. Ensure UTF-8 handling end-to-end or text truncates mid-glyph.",
  },
  {
    icon: "phone",
    title: "Mobile-first DOMs",
    detail:
      "Most Nepali portals serve heavy mobile layouts — lazy-loaded images, touch carousels and infinite scroll. Static parsers miss listings; render first, parse second.",
  },
];

/* ------------------------------------------------------------------ */
/* Recommended playbook                                                 */
/* ------------------------------------------------------------------ */

export const PLAYBOOK_STEPS: {
  step: string;
  title: string;
  icon: string;
  detail: string;
}[] = [
  {
    step: "01",
    title: "Render",
    icon: "monitor",
    detail:
      "Start with Crawlee + Playwright so JS-rendered listings, lazy-loading and infinite scroll are handled before a single selector runs.",
  },
  {
    step: "02",
    title: "Rotate",
    icon: "swap",
    detail:
      "Route through Zyte or Bright Data with Kathmandu-region residential IPs. Heavily-abused public pools get burned fast on Nepali targets.",
  },
  {
    step: "03",
    title: "Parse",
    icon: "code",
    detail:
      "Cheerio or BeautifulSoup on the rendered HTML. Keep selectors versioned — Nepali portals restyle frequently and break brittle paths.",
  },
  {
    step: "04",
    title: "Normalize",
    icon: "numbers",
    detail:
      "Convert Devanagari digits, translate Bikram Sambat to ISO, and strip mixed-script whitespace before anything enters your database.",
  },
  {
    step: "05",
    title: "Store",
    icon: "database",
    detail:
      "Ship to Postgres/ClickHouse with a source+fetched_at fingerprint per row so re-runs diff cleanly and history stays auditable.",
  },
  {
    step: "06",
    title: "Govern",
    icon: "gavel",
    detail:
      "Respect robots.txt, throttle to polite intervals, and only collect public, non-personal data. Nepal's data-protection regime is tightening — keep logs minimal.",
  },
];

export const STACK_RECOMMENDATIONS = [
  {
    title: "Quick start — static targets",
    stack: ["Cheerio", "axios-retry", "Postgres"],
    note: "Gharghaderi, Gharbazar, JobsNepal — light protection, static HTML.",
  },
  {
    title: "Standard — most sources",
    stack: ["Crawlee", "Playwright", "Zyte", "ClickHouse"],
    note: "Hamrobazaar, SastoDeal, Thulo, Nepal Homes, Merojob.",
  },
  {
    title: "Hard mode — Daraz",
    stack: ["Playwright stealth", "Bright Data Web Unlocker", "Session pools"],
    note: "ARES fingerprinting requires browser-grade TLS and session continuity.",
  },
];
