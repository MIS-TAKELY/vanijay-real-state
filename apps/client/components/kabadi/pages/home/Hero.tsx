import { Badge } from "@repo/ui";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-kabadi-border">
      <div className="kabadi-grid-bg absolute inset-0 pointer-events-none" />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[54rem] -translate-x-1/2 rounded-full bg-kabadi-accent/15 blur-[110px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-container-max px-gutter py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="border-kabadi-primary/25 bg-kabadi-primary-soft px-4 py-1.5 font-label-sm text-label-sm font-semibold text-kabadi-primary"
          >
            कबाडी बेच्नुहोस् · नगद पाउनुहोस्
            <span className="text-kabadi-muted">·</span>
            transparent Kathmandu rates
          </Badge>

          <h1 className="mt-6 font-display-lg text-5xl leading-[1.04] tracking-tight text-kabadi-on-bg md:text-7xl">
            Kabadi
          </h1>
        </div>
      </div>
    </section>
  );
}
