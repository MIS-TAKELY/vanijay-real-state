import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";

export function ResultsHeader() {
  return (
    <div className="mx-auto flex max-w-container-max flex-wrap items-center justify-between gap-sm px-gutter py-md">
      <p className="text-sm text-on-surface-variant">
        <span className="font-semibold text-on-surface">1,248</span> properties
        indexed in registry
      </p>
      <div className="flex items-center gap-xs text-sm text-on-surface-variant">
        <Label htmlFor="sort-select" className="font-medium">
          Sort by:
        </Label>
        <Select>
          <SelectTrigger
            id="sort-select"
            className="h-8 w-fit border-0 bg-transparent px-0 text-sm font-medium text-on-surface shadow-none focus-visible:ring-0"
          >
            <SelectValue placeholder="Latest Verified" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest Verified</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
