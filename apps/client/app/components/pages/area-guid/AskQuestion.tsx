"use client";

import { Card, Button } from "@repo/ui";

export function AskQuestion() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Question submitted (demo)");
  };

  return (
    <section className="flex justify-center px-6 py-20">
      <Card className="group relative w-full max-w-[672px] flex-col items-center gap-3 rounded-none border-[#C2C8C0] bg-white p-12 text-center shadow-none transition-all duration-200 hover:border-[#244530]/30 hover:shadow-lg">
        {/* Decorative corner accent */}
        <div
          className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#D8E6DC]/30 blur-2xl transition-all duration-500 group-hover:bg-[#D8E6DC]/50 group-hover:blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-[#244530]/5 blur-xl"
          aria-hidden
        />

        <h2
          className="relative text-2xl font-medium leading-8 text-[#1B1C19]"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontVariationSettings: "'opsz' 24",
          }}
        >
          Ask a question
        </h2>
        <p className="relative max-w-[544px] text-base leading-6 text-[#424842]">
          Our area experts and data analysts provide verified insights for
          Baluwatar real estate.
        </p>

        <form
          onSubmit={handleSubmit}
          className="relative mt-6 flex w-full flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g., What is the soil stability in North Baluwatar?"
              aria-label="Your question about Baluwatar"
              className="h-12 w-full border border-[#C2C8C0] bg-[#FBF9F4] px-6 text-base text-[#1B1C19] outline-none transition-all duration-200 placeholder:text-[#6B7280] focus:border-[#244530] focus:ring-2 focus:ring-[#244530]/10"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 whitespace-nowrap bg-[#244530] px-10 text-[13px] font-semibold tracking-[0.65px] text-white hover:bg-[#1a3526] hover:shadow-md active:scale-[0.97]"
          >
            ASK
          </Button>
        </form>

        <p className="relative mt-3 text-[11px] uppercase leading-4 tracking-[0.55px] text-[#727972] transition-colors duration-200 group-hover:text-[#424842]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#244530]/60" />
            TYPICAL RESPONSE TIME: 4 HOURS
          </span>
        </p>
      </Card>
    </section>
  );
}
