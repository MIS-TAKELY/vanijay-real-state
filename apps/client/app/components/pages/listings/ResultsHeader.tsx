export function ResultsHeader() {
  return (
    <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5">
      <p className="text-sm text-[#424842]">
        <span className="font-semibold text-[#1B1C19]">1,248</span> properties indexed in registry
      </p>
      <div className="flex items-center gap-2 text-sm text-[#424842]">
        <span>SORT BY:</span>
        <select className="border-0 bg-transparent text-sm font-medium text-[#1B1C19] outline-none">
          <option>Latest Verified</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest</option>
        </select>
      </div>
    </div>
  );
}
