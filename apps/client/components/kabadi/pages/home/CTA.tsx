import { ArrowRight, Phone, Truck } from "lucide-react";
import { Button } from "@repo/ui";

export function CTA() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="kabadi-grid-bg absolute inset-0 pointer-events-none" />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]"
        aria-hidden
      />

      <div className="relative mx-auto px-gutter text-center">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl bg-gold text-on-gold shadow-lg shadow-[color-mix(in_oklab,var(--color-gold)_30%,transparent)]">
          <Truck className="size-8" />
        </span>
        <h2 className="mt-6 font-display-lg text-4xl tracking-tight text-foreground md:text-5xl">
          Your kabadi is worth
          <span className="block bg-gradient-to-r from-primary via-gold-deep to-gold bg-clip-text text-transparent">
            more than you think.
          </span>
        </h2>
        <p className="mx-auto mt-5 text-base leading-relaxed text-muted-foreground">
          Check the rates, run the calculator, then book a pickup. We collect
          from your doorstep — same day in the Valley — and pay cash on the
          spot.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-auto bg-gold px-7! py-3.5 text-base font-semibold text-on-gold hover:bg-gold-deep hover:shadow-[0_0_28px_rgba(201,162,39,0.4)]"
          >
            <a href="#how-it-works">
              Book a pickup
              <ArrowRight />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-auto px-7! py-3.5 text-base font-semibold"
          >
            <a href="tel:9800522234">
              <Phone />
              9702634469
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
