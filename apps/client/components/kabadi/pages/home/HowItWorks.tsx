import {
  Banknote,
  CalendarCheck,
  PhoneCall,
  Recycle,
  Scale,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui";

const STEPS = [
  {
    icon: CalendarCheck,
    step: "01",
    title: "Book a pickup",
    detail:
      "Call or book a time slot online. Tell us what you're selling — copper, paper, an old fridge — and we bring the right team.",
  },
  {
    icon: Scale,
    step: "02",
    title: "Weigh at your door",
    detail:
      "No back-room scales. Your kabadi is weighed on a transparent digital scale in front of you, per the published rates.",
  },
  {
    icon: Banknote,
    step: "03",
    title: "Cash on the spot",
    detail:
      "The total is calculated live and paid in cash (or bank transfer) before we leave. The rate you saw is the rate you get.",
  },
  {
    icon: Recycle,
    step: "04",
    title: "Recycled responsibly",
    detail:
      "Your scrap goes to licensed recyclers and e-waste handlers — not a landfill. Selling kabadi becomes a climate win.",
  },
];

const TRUST = [
  { icon: Scale, label: "Transparent digital weighing" },
  { icon: Truck, label: "Same-day valley-wide pickup" },
  { icon: ShieldCheck, label: "Licensed recyclers only" },
  { icon: PhoneCall, label: "Rate confirmation before pickup" },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-b border-border py-16 md:py-24"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div className="max-w-2xl">
          <p className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.2em] text-primary">
            How it works
          </p>
          <h2 className="mt-2 font-display-lg text-4xl tracking-tight text-foreground">
            From doorstep to cash in four steps
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Built to fix the two things everyone hates about selling kabadi:
            unfair weighing and unclear prices.
          </p>
        </div>

        {/* Steps */}
        <ol className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.step} className="group">
                <Card className="h-full rounded-2xl border-border transition-all duration-300 group-hover:-translate-y-1 group-hover:border-gold/50 group-hover:shadow-[0_20px_44px_-20px_rgba(201,162,39,0.4)]">
                  <CardHeader>
                    <CardTitle className="font-display-lg text-4xl font-bold text-primary/15 transition-colors group-hover:text-primary/30">
                      {s.step}
                    </CardTitle>
                    <CardAction>
                      <span className="flex size-10 items-center justify-center rounded-xl bg-gold/15 text-gold-deep">
                        <Icon className="size-5" />
                      </span>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="pb-6">
                    <h3 className="text-base font-semibold text-foreground">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      {s.detail}
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>

        {/* Trust badges */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TRUST.map((t) => {
            const Icon = t.icon;
            return (
              <Badge
                key={t.label}
                variant="outline"
                className="justify-start gap-3 rounded-xl px-4 py-3.5 font-label-sm text-label-sm font-medium text-foreground"
              >
                <Icon className="size-5 shrink-0 text-primary" />
                {t.label}
              </Badge>
            );
          })}
        </div>
      </div>
    </section>
  );
}
