"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  className?: string;
  contentClassName?: string;
  triggerClassName?: string;
  disabled?: boolean;
  "aria-labelledby"?: string;
  "aria-label"?: string;
}

/**
 * Type-to-filter dropdown built on Radix Popover. The trigger looks like the
 * shared Select; the open panel contains a search input and a scrollable,
 * keyboard-navigable option list (↑/↓ to move, Enter to select).
 */
export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyLabel = "No results found.",
  className,
  contentClassName,
  triggerClassName,
  disabled,
  ...triggerProps
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [highlighted, setHighlighted] = React.useState(0);

  const selected = options.find((o) => o.value === value);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  React.useEffect(() => {
    setHighlighted(0);
  }, [search, open]);

  React.useEffect(() => {
    itemRefs.current[highlighted]?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const selectValue = (v: string) => {
    onValueChange?.(v);
    setOpen(false);
    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlighted];
      if (opt) selectValue(opt.value);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch("");
      }}
    >
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          {...triggerProps}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md px-3 text-sm outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50",
            className,
            triggerClassName,
          )}
        >
          <span
            className={cn("truncate", !selected && "text-muted-foreground")}
          >
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className={cn(
          "w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0",
          contentClassName,
        )}
      >
        <div className="flex items-center gap-2 border-b px-3 py-1">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="max-h-72">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {emptyLabel}
            </p>
          ) : (
            <ul role="listbox" className="p-1">
              {filtered.map((opt, i) => {
                const isSelected = opt.value === value;
                return (
                  <li key={opt.value} role="presentation">
                    <button
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlighted(i)}
                      onClick={() => selectValue(opt.value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2 text-left text-sm outline-none select-none",
                        i === highlighted
                          ? "bg-accent text-accent-foreground"
                          : "text-popover-foreground",
                      )}
                    >
                      {opt.label}
                      {isSelected && <Check className="size-4 shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
