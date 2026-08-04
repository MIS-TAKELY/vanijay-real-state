/**
 * Lekhaprati – Kageshwori Manohara Land Guide
 * React + Tailwind CSS
 *
 * Usage: <KageshworiGuide />
 */

/* -------------------------------------------------------------------------- */
/*  HEADER                                                                    */
/* -------------------------------------------------------------------------- */
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#C2C8C0] bg-[#FBF9F4]">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="text-lg font-bold text-[#244530]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Lekhaprati
          </a>
          <div className="hidden items-center gap-2 rounded border border-[#C2C8C0] bg-white px-3 py-1.5 sm:flex">
            <svg
              className="h-3.5 w-3.5 text-[#727972]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search districts, listings..."
              className="w-40 bg-transparent text-xs text-[#1B1C19] outline-none placeholder:text-[#9CA3AF]"
            />
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#"
            className="border-b-2 border-[#244530] pb-0.5 text-sm font-semibold text-[#244530]"
          >
            Area Guides
          </a>
          <a href="#" className="text-sm text-[#424842] hover:text-[#1B1C19]">
            NRN Concierge
          </a>
          <a href="#" className="text-sm text-[#424842] hover:text-[#1B1C19]">
            Listings
          </a>
          <a href="#" className="text-sm text-[#424842] hover:text-[#1B1C19]">
            About
          </a>
        </nav>

        <a
          href="#"
          className="inline-flex items-center justify-center border border-[#244530] px-3 py-1.5 text-[12px] font-semibold text-[#244530] hover:bg-[#244530] hover:text-white"
        >
          Sign In
        </a>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  SUB-NAV                                                                   */
/* -------------------------------------------------------------------------- */
function SubNav() {
  return (
    <div className="border-b border-[#C2C8C0] bg-[#FBF9F4]">
      <div className="mx-auto flex max-w-[1280px] gap-6 px-6">
        {["Overview", "Market", "Legal", "Listings"].map((tab, i) => (
          <a
            key={tab}
            href={`#${tab.toLowerCase()}`}
            className={`py-3 text-sm ${
              i === 0
                ? "border-b-2 border-[#244530] font-semibold text-[#244530]"
                : "text-[#424842] hover:text-[#1B1C19]"
            }`}
          >
            {tab}
          </a>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  HERO TITLE + CTA                                                          */
/* -------------------------------------------------------------------------- */
function PageHero() {
  return (
    <section className="px-6 pt-8 pb-6">
      <div className="mx-auto max-w-[1280px]">
        {/* Breadcrumb */}
        <p className="mb-3 text-xs text-[#727972]">
          Area Guides &nbsp;›&nbsp; Kathmandu Valley &nbsp;›&nbsp;{" "}
          <span className="text-[#424842]">Kageshwori Manohara</span>
        </p>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <h1
            className="max-w-[640px] text-[32px] font-semibold leading-tight tracking-[-0.5px] text-[#1B1C19]"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontVariationSettings: "'opsz' 32",
            }}
          >
            Kageshwori Manohara Land Guide —
            <br />
            Verified Prices, Maps &amp; Legal Status
          </h1>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <button
              type="button"
              className="border border-[#C2C8C0] bg-white px-4 py-2 text-label-sm font-semibold text-[#1B1C19] hover:border-[#244530]"
            >
              Talk to a Local Expert
            </button>
            <p className="text-[11px] text-[#727972]">
              Response within 4 hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  AERIAL + DISTRICT LEDGER                                                  */
/* -------------------------------------------------------------------------- */
function AerialAndLedger() {
  const ledger = [
    { label: "Population (Est.)", value: "133,000" },
    { label: "Elevation", value: "1,300m – 1,450m" },
    { label: "Growth Rate", value: "+4.2% YoY", highlight: true },
    { label: "Road Connectivity", value: "Blacktopped to corridor" },
    { label: "Nearest Hub", value: "Koteshwor (4.5km)" },
    { label: "Municipal Class", value: "Urban" },
    { label: "Utilities", value: "Elec/Water/Internet" },
    { label: "Avg. Plot Size", value: "4–10 aana" },
  ];

  return (
    <section className="px-6 pb-10">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Aerial image */}
        <div className="relative overflow-hidden border border-[#C2C8C0]">
          <div className="aspect-[16/9] bg-gradient-to-br from-[#A8B8A0] via-[#889878] to-[#6A7860]" />
          <div className="absolute bottom-0 left-0 right-0 bg-black/55 px-4 py-2.5 text-[11px] text-white">
            Aerial survey imagery, Q2 2024 — Boundary roads and ward demarcation
            &nbsp;·&nbsp; Survey ref: KM-2024-A1
          </div>
        </div>

        {/* District Ledger */}
        <div className="border border-[#C2C8C0] bg-white">
          <div className="border-b border-[#C2C8C0] px-5 py-3">
            <h3 className="text-sm font-semibold text-[#1B1C19]">
              District Ledger
            </h3>
          </div>
          <dl>
            {ledger.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-5 py-2.5 text-sm ${
                  i < ledger.length - 1 ? "border-b border-[#E8E4DC]" : ""
                }`}
              >
                <dt className="text-[#727972]">{row.label}</dt>
                <dd
                  className={`font-medium ${row.highlight ? "text-[#244530]" : "text-[#1B1C19]"}`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  WHY + ATTRIBUTES + EXPERT                                                 */
/* -------------------------------------------------------------------------- */
function WhySection() {
  return (
    <section className="px-6 pb-12">
      <div className="mx-auto max-w-[1280px]">
        <h2
          className="mb-4 text-xl font-medium text-[#1B1C19]"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Why Kageshwori Manohara?
        </h2>

        <div className="mb-6 max-w-[720px] space-y-3 text-sm leading-6 text-[#424842]">
          <p>
            Kageshwori Manohara represents the shifting frontier of the
            Kathmandu Valley&apos;s residential expansion. Once primarily
            agricultural, this corridor is currently undergoing disciplined
            structural transformation. Unlike the unplanned sprawl seen in older
            urban peripheries, recent municipal interventions have established a
            clearer grid of access roads and utility corridors.
          </p>
          <p>
            This structured growth, combined with its relatively flat terrain
            and proximity to major transport hubs (TIA and Koteshwor), makes it
            a strategic focus for both first-time buyers seeking buildable land
            and NRNs looking for predictable asset appreciation with lower title
            complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_280px]">
          {/* Attribute cards */}
          {[
            { label: "BEST FOR", value: "First-time buyers / NRNs" },
            { label: "TERRAIN", value: "Flat / Gentle Slopes" },
            { label: "TITLE COMPLEXITY", value: "◎ Low" },
          ].map((a) => (
            <div key={a.label} className="border border-[#C2C8C0] bg-white p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.6px] text-[#727972]">
                {a.label}
              </p>
              <p className="text-sm font-medium text-[#1B1C19]">{a.value}</p>
            </div>
          ))}

          {/* Expert quote */}
          <div className="border border-[#C2C8C0] bg-white p-4 sm:col-span-3 lg:col-span-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#244530] text-[10px] font-bold text-white">
                RK
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1B1C19]">
                  Ramesh Karki
                </p>
                <p className="text-[10px] text-[#727972]">
                  Senior Verification Officer
                </p>
              </div>
            </div>
            <p className="text-xs leading-5 text-[#424842]">
              &ldquo;When evaluating Kageshwori Manohara, distinguish between
              road-accessibility and road-adjacency. Many plots are accessible
              via newly bladed tracks, but only those adjacent to gazetted
              municipal roads guarantee long-term setback compliance for
              construction.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  PRICE INTELLIGENCE                                                        */
/* -------------------------------------------------------------------------- */
function PriceIntelligence() {
  const zones = [
    {
      zone: "Core Urban Edge",
      access: "12ft – 20ft Blacktopped",
      price: "5.5M – 7.0M",
      liquidity: "High",
    },
    {
      zone: "Developing Grid",
      access: "10ft – 13ft Gravel/Paved",
      price: "3.8M – 5.0M",
      liquidity: "Medium",
    },
    {
      zone: "Expansion Frontier",
      access: "10ft Dirt Track",
      price: "2.5M – 3.5M",
      liquidity: "Low",
    },
  ];

  return (
    <section id="market" className="border-t border-[#C2C8C0] px-6 py-10">
      <div className="mx-auto max-w-[1280px]">
        {/* Section tabs */}
        <div className="mb-8 flex gap-6 border-b border-[#E8E4DC]">
          {[
            "Land Market",
            "Legal & Verification",
            "Lifestyle & Access",
            "NRN Notes",
          ].map((t, i) => (
            <button
              key={t}
              type="button"
              className={`pb-3 text-sm ${
                i === 0
                  ? "border-b-2 border-[#244530] font-semibold text-[#244530]"
                  : "text-[#727972] hover:text-[#1B1C19]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className="text-xl font-medium text-[#1B1C19]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Price Intelligence
            </h2>
            <p className="text-sm text-[#727972]">
              Aggregated verified transaction data (Q1–Q2 2024)
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.5px] text-[#727972]">
              District Average
            </p>
            <p
              className="text-lg font-semibold text-[#1B1C19]"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Rs 4.5M{" "}
              <span className="text-sm font-normal text-[#727972]">/aana</span>
            </p>
            <p className="text-xs text-[#244530]">↗ 5.2% YoY growth</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#C2C8C0]">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#C2C8C0] bg-[#F5F3EE] text-[11px] font-semibold uppercase tracking-[0.5px] text-[#727972]">
                <th className="px-4 py-3">Zone Indicator</th>
                <th className="px-4 py-3">Access Road</th>
                <th className="px-4 py-3">Avg. Price (Rs/Aana)</th>
                <th className="px-4 py-3">Liquidity</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => (
                <tr
                  key={z.zone}
                  className={
                    i < zones.length - 1 ? "border-b border-[#E8E4DC]" : ""
                  }
                >
                  <td className="px-4 py-3.5 font-medium text-[#1B1C19]">
                    {z.zone}
                  </td>
                  <td className="px-4 py-3.5 text-[#424842]">{z.access}</td>
                  <td
                    className="px-4 py-3.5 font-medium text-[#1B1C19]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {z.price}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        z.liquidity === "High"
                          ? "bg-[#E8F0ED] text-[#244530]"
                          : z.liquidity === "Medium"
                            ? "bg-[#F5F0E8] text-[#8A7060]"
                            : "bg-[#F0EDE6] text-[#727972]"
                      }`}
                    >
                      {z.liquidity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  VERIFICATION TRANSPARENCY                                                 */
/* -------------------------------------------------------------------------- */
function VerificationTransparency() {
  const phases = [
    {
      num: "1",
      title: "Document Audit",
      desc: "Malpot (Land Revenue) records digitized and verified against NRN holding allowances.",
    },
    {
      num: "2",
      title: "Cadastral Audit",
      desc: "Napi (Survey) mapping cross-referenced with recent municipal road gazettes (2022–2024).",
    },
    {
      num: "3",
      title: "Field Audit",
      desc: "Physical verification of road widths, access points, and terrain characteristics by survey teams.",
    },
  ];

  return (
    <section id="legal" className="px-6 py-10">
      <div className="mx-auto max-w-[1280px] border border-[#C2C8C0] bg-[#F8F6F1] p-8">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-medium text-[#1B1C19]">
            <span className="text-[#244530]">☑</span> Verification Transparency
          </h2>
          <span className="rounded bg-[#244530] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.6px] text-white">
            ○ Guide Status: Verified
          </span>
        </div>
        <p className="mb-1 text-sm text-[#424842]">
          This area guide has passed the Lekhaprati 3-phase audit, ensuring all
          listed metrics and characterizations reflect on-the-ground reality
          rather than speculative marketing.
        </p>
        <p className="mb-6 text-xs text-[#727972]">Next Audit: Oct 2024</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {phases.map((p) => (
            <div key={p.num} className="border border-[#C2C8C0] bg-white p-5">
              <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#244530] text-xs font-bold text-white">
                {p.num}
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-[#1B1C19]">
                {p.title}
              </h3>
              <p className="text-xs leading-5 text-[#424842]">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  VERIFIED LISTINGS                                                         */
/* -------------------------------------------------------------------------- */
function VerifiedListings() {
  const plots = [
    {
      ward: "Ward 6, Thali",
      size: "4 Aana · 13ft Access · South Facing",
      price: "Rs 4.2M/a",
      map: "from-[#C8D5C0] to-[#A0B898]",
    },
    {
      ward: "Ward 5, Mulpani",
      size: "6.5 Aana · 20ft Blacktop · East Facing",
      price: "Rs 5.1M/a",
      map: "from-[#D4CFC4] to-[#B0A890]",
    },
    {
      ward: "Ward 7, Danchhi",
      size: "5 Aana · 10ft Dirt · South-West Facing",
      price: "Rs 3.5M/a",
      map: "from-[#C0C8D0] to-[#98A8B8]",
    },
  ];

  return (
    <section id="listings" className="px-6 py-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2
              className="text-xl font-medium text-[#1B1C19]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Verified Listings
            </h2>
            <p className="text-sm text-[#727972]">
              Currently available plots that pass our audit standards.
            </p>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-[#244530] hover:underline"
          >
            View all 12 listings →
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plots.map((p) => (
            <article key={p.ward} className="border border-[#C2C8C0] bg-white">
              {/* Cadastral placeholder */}
              <div className={`relative h-36 bg-gradient-to-br ${p.map}`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <svg className="h-full w-full" viewBox="0 0 200 120">
                    <line
                      x1="20"
                      y1="20"
                      x2="180"
                      y2="100"
                      stroke="#244530"
                      strokeWidth="1"
                    />
                    <line
                      x1="180"
                      y1="20"
                      x2="20"
                      y2="100"
                      stroke="#244530"
                      strokeWidth="1"
                    />
                    <rect
                      x="40"
                      y="30"
                      width="120"
                      height="60"
                      fill="none"
                      stroke="#244530"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <span className="absolute left-3 top-3 rounded bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-[#244530]">
                  ○ Verified Plot
                </span>
              </div>

              <div className="p-4">
                <h3 className="mb-0.5 text-sm font-semibold text-[#1B1C19]">
                  {p.ward}
                </h3>
                <p className="mb-3 text-xs text-[#727972]">{p.size}</p>
                <p
                  className="mb-3 text-base font-semibold text-[#244530]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {p.price}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#424842] hover:text-[#244530]"
                >
                  ⧉ View Cadastral Map
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  FOOTER                                                                    */
/* -------------------------------------------------------------------------- */
function Footer() {
  return (
    <footer className="border-t border-[#C2C8C0] bg-[#E4E2DD]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <a
            href="/"
            className="text-lg font-medium text-[#244530]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Lekhaprati
          </a>
          <p className="mt-1 text-xs text-[#727972]">
            © 2024 Lekhaprati Real Estate Archive. All rights reserved.
          </p>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.6px] text-[#1B1C19]">
            Resources
          </p>
          <ul className="space-y-1 text-sm text-[#424842]">
            <li>
              <a href="#" className="hover:text-[#244530]">
                Coverage Areas
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#244530]">
                Legal Policies
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.6px] text-[#1B1C19]">
            Settings
          </p>
          <ul className="space-y-1 text-sm text-[#424842]">
            <li>Language: English/Nepali</li>
            <li>Land Units: RAPD</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  MAIN                                                                      */
/* -------------------------------------------------------------------------- */
export default function KageshworiGuide() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1B1C19] antialiased">
      <SubNav />
      <main>
        <PageHero />
        <AerialAndLedger />
        <WhySection />
        <PriceIntelligence />
        <VerificationTransparency />
        <VerifiedListings />
      </main>
    </div>
  );
}
