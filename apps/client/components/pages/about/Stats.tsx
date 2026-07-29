import { about_stats } from "constants/varibles-constants";

export function Stats() {
  return (
    <section className="border-b border-outline-variant bg-primary relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
        aria-hidden
      />
      <div className="mx-auto max-w-container-max px-gutter py-xl relative z-10">
        <div className="text-center mb-xl">
          <h2 className="font-headline-md text-headline-md text-primary-fixed mb-sm">
            The Archive by the Numbers
          </h2>
          <p className="font-body-md text-primary-fixed-dim mx-auto">
            From 77 Land Revenue Offices to a single trusted archive.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {about_stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="mono-stat text-[36px] md:text-[44px] font-bold text-primary-fixed leading-none mb-xs">
                {s.value}
              </p>
              <p className="font-label-sm text-[13px] font-medium text-primary-fixed-dim">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
