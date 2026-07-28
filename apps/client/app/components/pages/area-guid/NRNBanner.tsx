import { Icon } from "@repo/ui";

const FEATURES = [
  {
    icon: "videocam",
    text: "Video-documented field reports (Drone & Ground)",
  },
  {
    icon: "description",
    text: "Complete Lalpurja (Title Deed) forensic audit",
  },
  {
    icon: "checklist",
    text: "Local government compliance checklist",
  },
];

export function NRNBanner() {
  return (
    <section className="bg-primary relative overflow-hidden border-y border-primary/20">
      {/* Decorative pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" aria-hidden />

      <div className="relative z-10 mx-auto max-w-container-max px-gutter py-16 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_auto]">
          {/* Content */}
          <div>
            <span className="mb-4 inline-block rounded border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[1px] text-white/80">
              Specialized Service
            </span>
            <h2
              className="mb-4 text-[36px] font-semibold leading-tight text-white"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontVariationSettings: "'opsz' 36",
              }}
            >
              Built for Non-Resident
              <br />
              Nepalis
            </h2>
            <p className="mb-6 max-w-[440px] text-sm leading-6 text-white/70">
              Invest with certainty from abroad. Our NRN concierge handles
              cross-border documentation and local compliance.
            </p>

            <ul className="mb-8 space-y-3">
              {FEATURES.map((f) => (
                <li
                  key={f.text}
                  className="flex items-center gap-3 text-sm text-white/90"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/80">
                    <Icon name={f.icon} className="text-[14px]" />
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="group inline-flex items-center gap-2 bg-white px-6 py-3 text-[13px] font-semibold text-primary hover:bg-[#FBF9F4] transition-all cursor-pointer"
            >
              Initiate Proxy Request
              <Icon
                name="arrow_forward"
                className="text-[16px] group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>

          {/* Document Mockup */}
          <div className="relative hidden lg:block">
            <div className="w-56 rotate-3 rounded border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm transition-transform duration-300 hover:rotate-0 hover:bg-white/10">
              {/* Stamp */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[1px] text-white/60">
                  Field Report
                </span>
                <Icon
                  name="description"
                  className="text-white/40 text-[16px]"
                />
              </div>

              {/* Document lines */}
              <div className="space-y-2">
                <div className="h-2 w-full rounded bg-white/10" />
                <div className="h-2 w-4/5 rounded bg-white/10" />
                <div className="h-2 w-3/5 rounded bg-white/10" />
                <div className="h-2 w-full rounded bg-white/10" />
                <div className="h-2 w-2/3 rounded bg-white/10" />
              </div>

              {/* Verified stamp */}
              <div className="mt-6 flex justify-end">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/40 text-white/80 transition-all duration-300 hover:border-white/70 hover:text-white">
                  <Icon name="verified" className="text-[18px]" />
                </div>
              </div>
            </div>

            {/* Decorative smaller card behind */}
            <div className="absolute -bottom-4 -right-4 -z-10 w-48 -rotate-6 rounded border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="space-y-1.5">
                <div className="h-1.5 w-3/4 rounded bg-white/5" />
                <div className="h-1.5 w-1/2 rounded bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
