export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-outline-variant bg-surface">
      {/* Topographic pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #244530 1px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-secondary-container/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-container-max px-gutter py-xl lg:py-[104px]">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="mb-md inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            About Lekhaprati
          </div>

          {/* H1 */}
          <h1 className="font-display-lg text-[42px] md:text-[54px] font-semibold leading-[1.08] tracking-[-1.12px] text-primary mb-md">
            The Archive of Record for&nbsp;
            <span className="text-on-surface">Legitimate Land Ownership</span>
          </h1>

          <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Lekhaprati exists to eliminate the risk of legal disputes in Nepali
            real estate. We cross-reference every listing against cadastral
            surveys, field reports, and Land Revenue Office master ledgers —
            before it is published.
          </p>
        </div>
      </div>
    </section>
  );
}