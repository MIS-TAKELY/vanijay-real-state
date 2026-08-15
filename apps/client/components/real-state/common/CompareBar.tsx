"use client";

import { Button, Icon } from "@repo/ui";
import Link from "next/link";
import { useCompareStore } from "store/compare";

export function CompareBar() {
  const { items, clear } = useCompareStore();

  if (items.length < 2) return null;

  const ids = items.map((i) => i.id).join(",");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant bg-surface/95 backdrop-blur-sm px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-outline-variant bg-surface-container text-[10px] font-bold text-on-surface-variant"
              title={item.title}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="truncate px-1">{item.title.slice(0, 2)}</span>
              )}
            </div>
          ))}
          <span className="shrink-0 text-label-sm font-medium text-on-surface-variant">
            {items.length} selected
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-label-sm font-medium text-on-surface-variant hover:text-on-surface"
          >
            Clear
          </Button>
          <Button asChild size="sm" className="bg-primary text-on-primary hover:bg-primary/90">
            <Link href={`/compare?ids=${ids}`}>
              Compare
              <Icon name="arrow_forward" className="ml-1 text-on-primary/80" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
