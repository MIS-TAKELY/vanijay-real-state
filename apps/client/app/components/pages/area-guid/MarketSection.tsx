import { Card } from "@repo/ui";

export function MarketSection() {
  return (
    <section className="border-t border-[#C2C8C0] bg-[#FBF9F4] px-6 py-12">
      <div className="mx-auto grid max-w-[1232px] grid-cols-1 gap-12 lg:grid-cols-[1fr_378px]">
        {/* Chart */}
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <div>
              <h2
                className="mb-1 text-2xl font-medium leading-8 text-[#1B1C19]"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontVariationSettings: "'opsz' 24",
                }}
              >
                Valuation History
              </h2>
              <p className="text-[13px] font-semibold leading-4 tracking-[0.65px] text-[#424842]">
                HISTORICAL PRICE TREND (Rs./AANA) · 12 MONTHS
              </p>
            </div>
            <div className="flex items-center gap-1 text-[13px] font-semibold leading-4 tracking-[0.65px] text-[#1B1C19]">
              <span className="h-3 w-3 rounded-sm bg-[#244530]" />
              Market Price
            </div>
          </div>

          <Card className="group h-64 flex-col rounded-none border-[#C2C8C0] bg-[#F5F3EE] p-6 shadow-none transition-all duration-200 hover:border-[#244530]/30 hover:shadow-md">
            <svg
              className="block w-full flex-1 transition-all duration-500"
              viewBox="0 0 755 206"
              preserveAspectRatio="none"
              aria-label="Price trend chart"
            >
              {/* Grid lines with fade */}
              <line
                x1="0"
                y1="41"
                x2="755"
                y2="41"
                stroke="#E0DDD6"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="82"
                x2="755"
                y2="82"
                stroke="#E0DDD6"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="123"
                x2="755"
                y2="123"
                stroke="#E0DDD6"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="164"
                x2="755"
                y2="164"
                stroke="#E0DDD6"
                strokeWidth="1"
              />

              {/* Area fill */}
              <path
                fill="rgba(36, 69, 48, 0.05)"
                className="transition-all duration-500 group-hover:fill-[rgba(36,69,48,0.08)]"
                d="M0,175 C50,172 100,165 150,155 C200,145 250,128 300,118 C350,108 400,95 450,80 C500,65 550,50 600,40 C650,32 700,28 755,25 L755,206 L0,206 Z"
              />
              {/* Line */}
              <path
                fill="none"
                stroke="#244530"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500 group-hover:stroke-[#1a3526]"
                d="M0,175 C50,172 100,165 150,155 C200,145 250,128 300,118 C350,108 400,95 450,80 C500,65 550,50 600,40 C650,32 700,28 755,25"
              />

              {/* Data point dots */}
              {[
                { cx: 0, cy: 175 },
                { cx: 100, cy: 165 },
                { cx: 200, cy: 145 },
                { cx: 300, cy: 118 },
                { cx: 400, cy: 95 },
                { cx: 500, cy: 65 },
                { cx: 600, cy: 40 },
                { cx: 755, cy: 25 },
              ].map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.cx}
                  cy={pt.cy}
                  r="3"
                  fill="#244530"
                  className="opacity-0 transition-all duration-300 group-hover:opacity-100"
                />
              ))}
            </svg>

            <div
              className="mt-1 flex justify-between text-[10px] leading-[15px] text-[#727972] transition-colors duration-200 group-hover:text-[#424842]"
              style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
            >
              <span>JUL 23</span>
              <span>SEP 23</span>
              <span>NOV 23</span>
              <span>JAN 24</span>
              <span>MAR 24</span>
              <span>MAY 24</span>
              <span>JUL 24</span>
            </div>
          </Card>
        </div>

        {/* What's Nearby */}
        <aside className="flex flex-col gap-6">
          <h2
            className="text-2xl font-medium leading-8 text-[#1B1C19]"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontVariationSettings: "'opsz' 24",
            }}
          >
            What&apos;s Nearby
          </h2>

          <div className="flex flex-col gap-2">
            {[
              {
                label: "SCHOOLS",
                value: "12 Premium Institutions",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
                  </svg>
                ),
              },
              {
                label: "MEDICAL",
                value: "Teaching Hospital (2.1km)",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                ),
              },
              {
                label: "CONNECTIVITY",
                value: "Main Ring Road Access",
                icon: (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M3 12h4l3-9 4 18 3-9h4" />
                  </svg>
                ),
              },
              {
                label: "INSTITUTIONS",
                value: "Diplomatic Quarter",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
                  </svg>
                ),
              },
            ].map((item) => (
              <Card
                key={item.label}
                className="group h-[66px] cursor-pointer flex-row items-center gap-6 rounded-none border-[#C2C8C0] bg-white p-3 shadow-none transition-all duration-200 hover:-translate-x-0.5 hover:border-[#244530]/30 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#D8E6DC] text-[#244530] transition-colors duration-200 group-hover:bg-[#244530] group-hover:text-white">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[13px] font-semibold leading-4 tracking-[0.65px] text-[#1B1C19] transition-colors duration-200 group-hover:text-[#244530]">
                    {item.label}
                  </p>
                  <p
                    className="text-sm leading-5 text-[#424842] transition-colors duration-200 group-hover:text-[#1B1C19]"
                    style={{
                      fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}