import { Card, CardContent, CardFooter, Button } from "@repo/ui";

export function Listings() {
  const listings = [
    {
      title: "North-Facing Corner Plot",
      price: "Rs. 95L/A",
      aana: "10.5 Aana",
      access: "20 ft Access",
      ref: "REF: LKP-BAL-001",
      gradient: "from-[#B8C9B0] via-[#8FA88A] to-[#6B8A65]",
    },
    {
      title: "Diplomatic Enclave Side Plot",
      price: "Rs. 102L/A",
      aana: "8.2 Aana",
      access: "16 ft Access",
      ref: "REF: LKP-BAL-042",
      gradient: "from-[#D0C4B0] via-[#B0A088] to-[#8A7A60]",
    },
    {
      title: "Residential Square Parcel",
      price: "Rs. 88L/A",
      aana: "5.0 Aana",
      access: "14 ft Access",
      ref: "REF: LKP-BAL-019",
      gradient: "from-[#B8C8D0] via-[#90A8B8] to-[#6A8898]",
    },
  ];

  return (
    <section className="bg-[#F5F3EE] py-20">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2
              className="mb-1 text-2xl font-medium leading-8 text-[#1B1C19]"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontVariationSettings: "'opsz' 24",
              }}
            >
              Verified Listings in Baluwatar
            </h2>
            <p className="text-base leading-6 text-[#424842]">
              Pre-vetted land survey documents and title deeds.
            </p>
          </div>
          <Button variant="outline" size="lg" asChild className="border-[#1B1C19] text-[13px] font-semibold tracking-[0.65px] text-[#1B1C19] hover:bg-[#1B1C19] hover:text-white">
            <a href="#">VIEW ALL 18 LISTINGS</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <Card
              key={item.ref}
              className="group h-[420px] cursor-pointer overflow-hidden rounded-none border-[#C2C8C0] bg-white p-0 shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-[#244530]/30 hover:shadow-xl"
            >
              {/* Image + Badge */}
              <div className="relative h-56 overflow-hidden">
                <div
                  className={`h-full w-full bg-gradient-to-br transition-transform duration-500 group-hover:scale-105 ${item.gradient}`}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                <span
                  className="absolute left-[23px] top-[19px] inline-flex items-center gap-1 border border-[#7D1118] bg-white/90 px-2 py-1 text-[10px] font-bold uppercase leading-[15px] tracking-[1px] text-[#7D1118] shadow-sm backdrop-blur-[2px] transition-all duration-300 group-hover:bg-white group-hover:shadow-md"
                  style={{ transform: "rotate(-6deg)" }}
                >
                  <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  VERIFIED
                </span>
              </div>

              {/* Body */}
              <CardContent className="flex flex-1 flex-col gap-3 p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className="text-2xl font-medium leading-[30px] text-[#1B1C19] transition-colors duration-200 group-hover:text-[#244530]"
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontVariationSettings: "'opsz' 24",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="whitespace-nowrap font-mono text-xl font-medium leading-6 text-[#244530]"
                    style={{
                      fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                    }}
                  >
                    {item.price}
                  </p>
                </div>

                <div
                  className="flex gap-6 text-sm leading-5 text-[#424842]"
                  style={{
                    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                  }}
                >
                  <span>{item.aana}</span>
                  <span>{item.access}</span>
                </div>
              </CardContent>

              <CardFooter className="mt-auto flex items-center justify-between border-t border-[#C2C8C0] px-6 pt-3 pb-0 transition-colors duration-200 group-hover:border-[#244530]/20">
                <span className="text-[11px] leading-4 text-[#727972] transition-colors duration-200 group-hover:text-[#424842]">
                  {item.ref}
                </span>
                <a
                  href="#"
                  className="text-[13px] font-semibold tracking-[0.65px] text-[#244530] opacity-0 transition-all duration-200 group-hover:opacity-100"
                >
                  VIEW DETAILS →
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
