export function ProcessAndBooking() {
  const steps = [
    {
      num: "1",
      title: "SELECTION",
      desc: "Identify surveyed lots via our digital archive.",
    },
    {
      num: "2",
      title: "VERIFICATION",
      desc: "Title search and digital verification of maps.",
    },
    {
      num: "3",
      title: "POA FILING",
      desc: "Execute Power of Attorney at the nearest Embassy.",
    },
    {
      num: "4",
      title: "SETTLEMENT",
      desc: "Secure escrow and title transfer completion.",
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
    <section className="px-6 pb-20">
      <div className="mx-auto max-w-[1232px]">
        <h2
          className="mb-10 text-2xl font-medium leading-8 text-[#1B1C19]"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontVariationSettings: "'opsz' 24",
          }}
        >
          How a Remote Purchase Works
        </h2>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          {/* Steps */}
          <div>
            <div className="relative flex justify-between">
              <div className="absolute left-0 right-0 top-5 h-px bg-[#C2C8C0]" />
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="relative z-10 flex w-[22%] flex-col items-start"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#244530] text-sm font-semibold text-white">
                    {step.num}
                  </div>
                  <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.8px] text-[#1B1C19]">
                    {step.title}
                  </p>
                  <p className="text-sm leading-5 text-[#424842]">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Book Walkthrough */}
          <div className="border border-[#C2C8C0] bg-white p-7">
            <h3
              className="mb-2 text-xl font-medium leading-7 text-[#1B1C19]"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontVariationSettings: "'opsz' 20",
              }}
            >
              Book a Video Walkthrough
            </h3>
            <p className="mb-6 text-sm leading-6 text-[#424842]">
              Schedule a live tour of specific plots with our on-site surveyors.
            </p>

            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.5px] text-[#727972]">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="mb-5 grid grid-cols-7 gap-1 text-center">
              {days.map((day) => (
                <button
                  key={day.d}
                  type="button"
                  className={`flex h-9 items-center justify-center text-sm ${
                    day.active
                      ? "bg-[#244530] font-semibold text-white"
                      : "text-[#1B1C19] hover:bg-[#E8F0ED]"
                  }`}
                >
                  {day.d}
                </button>
              ))}
            </div>

            <input
              type="email"
              placeholder="Email Address"
              className="mb-3 h-11 w-full border border-[#C2C8C0] bg-[#FBF9F4] px-4 text-sm text-[#1B1C19] outline-none placeholder:text-[#9CA3AF] focus:border-[#244530]"
            />

            <div className="flex gap-2">
              <select className="h-11 flex-1 border border-[#C2C8C0] bg-[#FBF9F4] px-3 text-sm text-[#1B1C19] outline-none focus:border-[#244530]">
                <option>09:00 NPT</option>
                <option>11:00 NPT</option>
                <option>14:00 NPT</option>
                <option>16:00 NPT</option>
              </select>
              <button
                type="button"
                className="h-11 bg-[#244530] px-6 text-[13px] font-semibold tracking-[0.6px] text-white hover:bg-[#1a3526]"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}