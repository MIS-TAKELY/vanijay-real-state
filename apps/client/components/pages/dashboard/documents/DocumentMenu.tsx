"use client";

import { cn, Icon } from "@repo/ui";
import { useEffect, useRef, useState } from "react";
import { DOC_MENU_ITEMS } from "./constants";

/**
 * Document card `...` menu (DESIGN.md §5.3): Preview / Replace / Download /
 * Delete. Click-outside + Escape to close.
 */
export function DocumentMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Document actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
      >
        <Icon name="more_vert" className="text-[20px]" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-outline-variant bg-surface py-1 shadow-lg"
        >
          {DOC_MENU_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-sm px-md py-2 text-left text-sm text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <Icon name={item.icon} className="text-body-lg" />
              <span className={cn(item.destructive && "text-error")}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
