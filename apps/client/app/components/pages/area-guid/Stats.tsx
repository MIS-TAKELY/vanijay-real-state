import { Card } from "@repo/ui";

export function Stats() {
  const cards = [
    {
      label: "MEDIAN PRICE / AANA",
      value: "Rs. 92L",
      meta: "BASED ON LAST 90 DAYS",
      green: true,
    },
    {
      label: "VERIFIED TRANSACTIONS",
      value: "34",
      meta: "FY 2080/81 ARCHIVE",
      green: false,
    },
    {
      label: "PRICE TREND (12M)",
      value: "+4.2%",
      meta: "STEADY APPRECIATION",
      green: true,
      trend: true,
    },
    {
      label: "AVG. ROAD WIDTH",
      value: "16 ft",
      meta: "RESIDENTIAL STANDARDS",
      green: false,
    },
  ];

  return (
    <section className="bg-[#FBF9F4] px-6 py-12">
      <div className="mx-auto flex max-w-[1232px] flex-col gap-6 sm:flex-row">
        {cards.map((card) => (
          <Card
            key={card.label}
            className="group min-h-[115px] flex-1 cursor-default gap-1 rounded-none border-[#C2C8C0] bg-white p-6 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-[#244530]/40 hover:shadow-lg"
          >
            <p className="text-[13px] font-semibold leading-4 tracking-[0.65px] text-[#424842] transition-colors duration-200 group-hover:text-[#244530]">
              {card.label}
            </p>
            <p
              className={`font-mono text-xl font-medium leading-6 transition-colors duration-200 ${
                card.green ? "text-[#244530]" : "text-[#1B1C19]"
              }`}
              style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
            >
              {card.trend ? (
                <span className="inline-flex items-center gap-1">
                  {card.value}
                  <span
                    className="inline-block h-[9px] w-[15px] bg-[#244530] transition-transform duration-300 group-hover:scale-125"
                    style={{
                      clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                      transform: "scaleY(-1)",
                    }}
                    aria-hidden
                  />
                </span>
              ) : (
                card.value
              )}
            </p>
            <p className="text-[11px] leading-4 text-[#727972] transition-colors duration-200 group-hover:text-[#424842]">
              {card.meta}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}