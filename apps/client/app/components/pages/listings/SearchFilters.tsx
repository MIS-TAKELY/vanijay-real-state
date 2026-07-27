export function SearchFilters() {
  return (
    <section className="border-b border-[#C2C8C0] bg-[#FBF9F4] px-6 py-6">
      <div className="mx-auto max-w-[1280px]">
        {/* Search bar */}
        <div className="mb-5 flex items-center gap-3 rounded border border-[#C2C8C0] bg-white px-4 py-3">
          <svg className="h-5 w-5 text-[#727972]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by location, property ID, or keyword..."
            className="w-full bg-transparent text-sm text-[#1B1C19] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#727972]">
              PROPERTY TYPE
            </label>
            <select className="h-10 w-full border border-[#C2C8C0] bg-white px-3 text-sm text-[#1B1C19] outline-none focus:border-[#244530]">
              <option>All Types</option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Apartment</option>
              <option>Plot</option>
            </select>
          </div>

          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#727972]">
              PRICE RANGE (NPR)
            </label>
            <select className="h-10 w-full border border-[#C2C8C0] bg-white px-3 text-sm text-[#1B1C19] outline-none focus:border-[#244530]">
              <option>Any Price</option>
              <option>Under 20L</option>
              <option>20L – 50L</option>
              <option>50L – 1Cr</option>
              <option>1Cr+</option>
            </select>
          </div>

          <div className="min-w-[160px] flex-1">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#727972]">
              DISTRICT/WARD
            </label>
            <input
              type="text"
              placeholder="e.g. Kathmandu 03"
              className="h-10 w-full border border-[#C2C8C0] bg-white px-3 text-sm text-[#1B1C19] outline-none placeholder:text-[#9CA3AF] focus:border-[#244530]"
            />
          </div>

          <div className="min-w-[160px] flex-1">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#727972]">
              LAND SIZE (RAPD)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Min"
                className="h-10 w-full border border-[#C2C8C0] bg-white px-3 text-sm text-[#1B1C19] outline-none placeholder:text-[#9CA3AF] focus:border-[#244530]"
              />
              <input
                type="text"
                placeholder="Max"
                className="h-10 w-full border border-[#C2C8C0] bg-white px-3 text-sm text-[#1B1C19] outline-none placeholder:text-[#9CA3AF] focus:border-[#244530]"
              />
            </div>
          </div>

          <button
            type="button"
            className="h-10 shrink-0 bg-[#244530] px-5 text-[13px] font-semibold tracking-[0.4px] text-white hover:bg-[#1a3526]"
          >
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              APPLY FILTERS
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}