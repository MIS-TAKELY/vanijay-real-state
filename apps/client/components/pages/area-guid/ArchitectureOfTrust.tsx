import { Icon } from "@repo/ui";
import { pillars } from "constants/varibles-constants";

const ICON_MAP: Record<string, string> = {
  "📄": "description",
  "📍": "location_on",
  "⚖": "balance",
};

export function ArchitectureOfTrust() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        <div className="text-center mb-12">
          <h2 className="font-headline-md text-headline-md text-primary mb-3">
            The Architecture of Trust
          </h2>
          <p className="text-body-md text-on-surface-variant max-w-[520px] mx-auto leading-relaxed">
            Every listing on Lekhaprati undergoes a rigid, three-phase archival
            audit before being indexed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className="group bg-surface border border-outline-variant rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 text-left"
              style={{
                animation: `fadeIn 0.5s ease-out ${i * 0.15}s both`,
              }}
            >
              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                <Icon
                  name={ICON_MAP[p.icon] || "verified"}
                  className="text-[20px]"
                  filled
                />
              </div>

              {/* Title */}
              <h3 className="text-[13px] font-bold uppercase tracking-[0.6px] text-on-surface group-hover:text-primary transition-colors mb-3">
                {p.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-6 text-on-surface-variant">
                {p.desc}
              </p>

              {/* Decorative bottom accent */}
              <div className="mt-5 h-px w-0 group-hover:w-full bg-primary/20 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
