const milestones = [
  {
    year: "2022",
    title: "The Idea",
    desc: "Co-founders identify the systemic title-dispute problem in Nepali real estate after witnessing a decade-long land conflict within their own families.",
  },
  {
    year: "2023",
    title: "Field Trials",
    desc: "Pilot verification programme across three Kathmandu wards. 47 plots field-checked; 22% had discrepancies. The model proves its necessity.",
  },
  {
    year: "2024",
    title: "Public Launch",
    desc: "Lekhaprati goes live as a public-trust archive. First 74 districts indexed; 12,000+ cadastral-cleared listings published.",
  },
  {
    year: "2025",
    title: "NRN Concierge",
    desc: "Launch of the Non-Resident Nepali concierge desk. Remote verification services extended to NRN citizens and FCNO investors worldwide.",
  },
];

export function Timeline() {
  return (
    <section className="border-b border-outline-variant bg-surface">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        <div className="mb-xl text-center max-w-2xl mx-auto">
          <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface-variant mb-xs">
            Our Journey
          </p>
          <h2 className="font-headline-md text-headline-md text-primary mb-sm">
            The Timeline of the Archive
          </h2>
        </div>

        <div className="relative">
          {/* Vertical line (desktop) */}
          <div
            className="absolute left-6 top-0 bottom-0 w-px bg-outline-variant hidden md:block"
            aria-hidden
          />

          <div className="space-y-xl md:space-y-0 md:relative">
            {milestones.map((m) => (
              <div
                key={m.year}
                className="md:flex md:items-start md:gap-xl md:pb-xl"
              >
                {/* Year badge */}
                <div className="relative z-10 mb-sm md:mb-0 md:w-28 shrink-0">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface px-4 py-2 shadow-sm md:w-full md:justify-center">
                    <span className="mono-stat text-sm font-bold text-primary">
                      {m.year}
                    </span>
                  </div>
                  {/* Dot on the line */}
                  <div
                    className="hidden md:block absolute top-1/2 -right-[13px] h-3 w-3 rounded-full bg-primary border-2 border-surface"
                    aria-hidden
                  />
                </div>

                {/* Content card */}
                <div className="flex-1 md:pl-xl">
                  <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-lg transition-[transform,box-shadow] duration-300 hover:shadow-md">
                    <h3 className="font-headline-md text-lg font-semibold text-on-surface mb-xs">
                      {m.title}
                    </h3>
                    <p className="text-sm leading-6 text-on-surface-variant">
                      {m.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}