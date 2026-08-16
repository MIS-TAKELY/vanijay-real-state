"use client";
import {
  Button,
  Icon,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";

export function ProcessAndBooking() {
  const steps = [
    {
      num: "1",
      title: "Selection",
      desc: "Identify cadastral-cleared, surveyed lots via our digital archive.",
      icon: "search",
    },
    {
      num: "2",
      title: "Verification",
      desc: "Title search and field verification of maps by on-site surveyors.",
      icon: "verified",
    },
    {
      num: "3",
      title: "POA Filing",
      desc: "Execute Power of Attorney at the nearest Nepali embassy or consulate.",
      icon: "gavel",
    },
    {
      num: "4",
      title: "Settlement",
      desc: "Secure escrow and title transfer completion with legal representation.",
      icon: "account_balance",
    },
  ];

  const days = [
    { d: "22", active: false },
    { d: "23", active: false },
    { d: "24", active: true },
    { d: "25", active: false },
    { d: "26", active: false },
    { d: "27", active: false },
    { d: "28", active: false },
  ];

  return (
    <section id="process" className="bg-surface scroll-mt-20">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        {/* Section intro — E-E-A-T content */}
        <div className="mb-xl max-w-2xl">
          <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface-variant mb-xs">
            Step 02 — The Remote Purchase Process
          </p>
          <h2 className="font-headline-md text-headline-md text-primary mb-sm">
            How a Remote Land Purchase Works
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            From identifying a verified plot to escrow-protected title transfer,
            our four-stage concierge process is designed so Non-Resident Nepalis
            can complete a secure land acquisition entirely from abroad — with
            legal representation at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1fr_360px]">
          {/* Steps */}
          <div>
            <div className="relative flex justify-between">
              <div
                className="absolute left-0 right-0 top-5 h-px bg-outline-variant"
                aria-hidden
              />
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="relative z-10 flex w-[22%] flex-col items-start"
                >
                  <div className="mb-md flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-sm">
                    <Icon name={step.icon} filled className="text-[24px]" />
                  </div>
                  <p className="mb-xs text-[12px] font-bold uppercase tracking-[0.8px] text-on-surface">
                    <span className="mono-stat text-primary mr-xs">
                      {step.num}
                    </span>
                    {step.title}
                  </p>
                  <p className="text-sm leading-5 text-on-surface-variant">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Book Walkthrough */}
          <div className="rounded-2xl border border-outline-variant bg-surface p-lg shadow-sm">
            <h3 className="mb-xs font-headline-md text-lg font-medium leading-7 text-on-surface">
              Book a Video Walkthrough
            </h3>
            <p className="mb-md text-sm leading-6 text-on-surface-variant">
              Schedule a live tour of specific plots with our on-site surveyors.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              aria-label="Book a video walkthrough"
              className="space-y-sm"
            >
              <div className="mb-xs grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.5px] text-on-surface-variant">
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              <div className="mb-sm grid grid-cols-7 gap-1 text-center">
                {days.map((day) => (
                  <button
                    key={day.d}
                    type="button"
                    aria-pressed={day.active}
                    aria-label={`Select day ${day.d}`}
                    className={`flex h-9 cursor-pointer items-center justify-center rounded-md text-sm transition-colors ${
                      day.active
                        ? "bg-primary font-semibold text-on-primary"
                        : "text-on-surface hover:bg-secondary-container"
                    }`}
                  >
                    {day.d}
                  </button>
                ))}
              </div>

              <div>
                <Label
                  htmlFor="walkthrough-email"
                  className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.6px] text-on-surface"
                >
                  Email Address
                </Label>
                <Input
                  id="walkthrough-email"
                  type="email"
                  placeholder="you@example.com"
                  className="mb-sm h-11 w-full rounded-md border-outline-variant bg-surface px-4"
                />
              </div>

              <div>
                <Label
                  htmlFor="walkthrough-time"
                  className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.6px] text-on-surface"
                >
                  Time Slot (NPT)
                </Label>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger
                      id="walkthrough-time"
                      className="h-11 flex-1"
                    >
                      <SelectValue placeholder="09:00 NPT" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00 NPT</SelectItem>
                      <SelectItem value="11:00">11:00 NPT</SelectItem>
                      <SelectItem value="14:00">14:00 NPT</SelectItem>
                      <SelectItem value="16:00">16:00 NPT</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-label-sm font-semibold tracking-[0.6px] text-on-primary hover:bg-primary/90"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
