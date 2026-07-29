export function Pagination() {
  const pages = ["01", "02", "03"];
  return (
    <nav
      aria-label="Pagination"
      className="mx-auto flex max-w-container-max items-center justify-center gap-xs px-gutter py-xl"
    >
      <button
        type="button"
        aria-label="Previous page"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <span aria-hidden>&larr;</span>
      </button>
      <button
        type="button"
        aria-label="Page 1, current page"
        aria-current="page"
        className="cursor-pointer rounded-md border-b-2 border-primary px-sm text-sm font-semibold text-primary transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        01
      </button>
      {pages.slice(1).map((p) => (
        <button
          key={p}
          type="button"
          aria-label={`Page ${p}`}
          className="cursor-pointer rounded-md px-sm text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          {p}
        </button>
      ))}
      <span className="px-xs text-sm text-on-surface-variant" aria-hidden>
        &hellip;
      </span>
      <button
        type="button"
        aria-label="Page 12"
        className="cursor-pointer rounded-md px-sm text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        12
      </button>
      <button
        type="button"
        aria-label="Next page"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <span aria-hidden>&rarr;</span>
      </button>
    </nav>
  );
}
