import React from "react";

const tickerItems = [
  "#LT-9923 SOLD • रू 45,000,000",
  "VERIFICATION IN PROGRESS: DISTRICT LAMJUNG",
  "#BK-1102 NEW LISTING • रू 12,800,000",
  "ANNUAL VALUATION UPDATE: KATHMANDU +8.4%",
];

export function ActivityTicker() {
  return (
    <section className="bg-primary py-md overflow-hidden relative z-10 shadow-lg">
      <div className="flex whitespace-nowrap gap-xl animate-scroll hover:pause">
        {[0, 1].map((set) => (
          <div key={set} className="flex items-center gap-md">
            {tickerItems.map((item, i) => (
              <React.Fragment key={`${set}-${i}`}>
                <span className="mono-stat text-primary-fixed tracking-tighter uppercase text-sm">
                  {item}
                </span>
                <span className="w-2 h-2 rounded-full bg-primary-fixed-dim" />
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
