"use client";

import { useState } from "react";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Icon,
} from "@repo/ui";
import { ChevronDown } from "lucide-react";
import { AppModeStrip } from "components/shared/AppModeStrip";

export function FooterAppsSwitcher() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Switch app"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors duration-200",
            open
              ? "border-gold bg-white/10 text-gold"
              : "border-white/20 text-white/70 hover:border-gold/60 hover:bg-white/5 hover:text-gold",
          )}
        >
          <Icon name="grid_view" className="text-[14px]" />
          <span>Switch App</span>
          <ChevronDown
            className={cn(
              "size-3 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[280px] overflow-hidden rounded-2xl border border-outline-variant bg-surface p-0 shadow-xl"
      >
        <p className="flex items-center gap-2 px-2 pb-2 pt-2 font-label-sm text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
          <Icon name="grid_view" className="text-[14px]" />
          Switch app
        </p>
        <AppModeStrip compact />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
