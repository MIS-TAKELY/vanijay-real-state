export function ResultsHeader() {
  return (
    <div className="mx-auto flex max-w-container-max flex-wrap items-center justify-between gap-sm px-gutter py-md">
      <p className="text-sm text-on-surface-variant">
        <span className="font-semibold text-on-surface">1,248</span> properties
        indexed in registry
      </p>
      <div className="flex items-center gap-xs text-sm text-on-surface-variant">
        <label htmlFor="sort-select" className="font-medium">
          Sort by:
        </label>
        <select
          id="sort-select"
          className="cursor-pointer rounded-md border-0 bg-transparent text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option>Latest Verified</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest</option>
        </select>
      </div>
    </div>
  );
}
