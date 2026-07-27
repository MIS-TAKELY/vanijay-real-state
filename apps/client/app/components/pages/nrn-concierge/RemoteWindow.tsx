export function RemoteWindow() {
  return (
    <section className="border-t border-[#C2C8C0] px-6 py-20">
      <div className="mx-auto grid max-w-[1232px] grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <h2
            className="mb-4 text-[32px] font-semibold leading-10 tracking-[-0.4px] text-[#1B1C19]"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontVariationSettings: "'opsz' 32",
            }}
          >
            Your Remote Window to Nepal
          </h2>
          <p className="mb-8 max-w-[440px] text-base leading-7 text-[#424842]">
            We provide high-resolution drone footage and cadastral overlays so
            you can see your future land from any continent with absolute
            clarity.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm font-medium text-[#1B1C19]">
              <svg
                className="h-5 w-5 text-[#244530]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              4K DRONE OVERLAYS
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-[#1B1C19]">
              <svg
                className="h-5 w-5 text-[#244530]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              HISTORICAL TITLE LOGS
            </li>
          </ul>
        </div>

        {/* Monitor mockup */}
        <div className="relative">
          <div className="overflow-hidden rounded-lg border border-[#C2C8C0] bg-[#E8E4DC] shadow-lg">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-[#D4CFC4] to-[#B8B0A0]">
              <div className="absolute inset-4 rounded bg-[#F5F3EE] p-3 shadow-inner">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wide text-[#244530]">
                    KATHMANDU VALLEY — CADASTRAL
                  </span>
                  <span className="rounded bg-[#244530] px-1.5 py-0.5 text-[9px] text-white">
                    LIVE
                  </span>
                </div>
                <div className="h-[70%] rounded bg-gradient-to-br from-[#C8D5C0] via-[#A8BFA0] to-[#8AA87A] opacity-90" />
                <div className="mt-2 flex gap-2">
                  <div className="h-1.5 w-12 rounded bg-[#244530]/30" />
                  <div className="h-1.5 w-8 rounded bg-[#244530]/20" />
                </div>
              </div>
            </div>
            <div className="mx-auto h-3 w-24 bg-[#9C9588]" />
            <div className="mx-auto h-1.5 w-32 rounded-b bg-[#8A8378]" />
          </div>
        </div>
      </div>
    </section>
  );
}
