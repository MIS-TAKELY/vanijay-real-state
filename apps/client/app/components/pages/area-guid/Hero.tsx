export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#C2C8C0] px-6 pb-16 pt-24">
      {/* Subtle background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #244530 1px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
        aria-hidden
      />

      {/* Decorative corner accent */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#244530]/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#D8E6DC]/40 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1232px] animate-[fadeIn_0.6s_ease-out]">
        {/* Location badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C2C8C0] bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#244530] shadow-sm backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#244530]" />
          Area Guide
        </div>

        <h1
          className="mb-4 text-[48px] font-semibold leading-[56px] tracking-[-0.96px] text-[#1B1C19] md:text-[56px] md:leading-[64px] md:tracking-[-1.12px]"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontVariationSettings: "'opsz' 48",
          }}
        >
          Baluwatar, Kathmandu
        </h1>
        <p className="max-w-[672px] text-lg leading-7 text-[#424842]">
          The administrative and residential heart of Kathmandu, known for its
          premium land value and government diplomatic enclaves.
        </p>

        {/* Quick stats row */}
        <div className="mt-8 flex flex-wrap gap-8">
          {[
            { label: "Area Type", value: "Premium Residential" },
            { label: "Avg. Price/Aana", value: "Rs. 92L" },
            { label: "Zone", value: "Ward 03" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="h-8 w-px bg-[#C2C8C0]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#727972]">
                  {stat.label}
                </p>
                <p
                  className="text-sm font-medium text-[#1B1C19]"
                  style={{
                    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                  }}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
