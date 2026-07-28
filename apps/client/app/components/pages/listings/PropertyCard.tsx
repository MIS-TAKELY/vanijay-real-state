import Link from "next/link";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: string;
    location: string;
    gradient: string;
    meta: string[];
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/listings/${property.id}`}>
      <article className="flex flex-col overflow-hidden border border-[#C2C8C0] bg-white">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <div
            className={`h-full w-full bg-gradient-to-br ${property.gradient}`}
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-white/95 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.6px] text-[#7D1118] shadow-sm">
            <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            VERIFIED ARCHIVE
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <h3
            className="mb-1 text-lg font-medium leading-6 text-[#1B1C19]"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontVariationSettings: "'opsz' 18",
            }}
          >
            {property.title}
          </h3>

          <span className="mb-3 inline-block w-fit rounded bg-[#EDEAE3] px-2 py-0.5 text-[11px] font-medium text-[#424842]">
            ID: {property.id}
          </span>

          <p className="mb-0.5 text-lg font-semibold text-[#7D1118]">
            {property.price}
          </p>
          <p className="mb-4 text-sm text-[#727972]">{property.location}</p>

          <div className="mb-5 space-y-1 border-t border-[#E8E4DC] pt-3 text-sm text-[#424842]">
            {property.meta.map((m) => (
              <p key={m} className="flex items-center gap-1.5">
                <span className="text-[#727972]">·</span> {m}
              </p>
            ))}
          </div>

          <div className="mt-auto flex gap-2">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-1.5 border border-[#C2C8C0] py-2.5 text-[13px] font-semibold text-[#1B1C19] hover:border-[#244530] hover:text-[#244530]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Add to Cart
            </button>
            <button
              type="button"
              className="flex-1 bg-[#244530] py-2.5 text-[13px] font-semibold text-white hover:bg-[#1a3526]"
            >
              View Details
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
