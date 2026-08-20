"use client";

import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";

import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface BouncingAppSwitcherProps {
  /** Dropdown content, e.g. an app-mode list. */
  children: React.ReactNode;
  /** Dark-navbar styling for the trigger (metals app). */
  dark?: boolean;
  /** Accessible label for the trigger. Defaults to `Switch app`. */
  label?: string;
  /** Extra classes for the dropdown panel. */
  panelClassName?: string;
  /**
   * Whether to run the first-visit attention bounce. Defaults to `true`.
   * Pass `false` to disable.
   */
  attention?: boolean;
}

function BouncingAppSwitcher({
  children,
  dark = false,
  label = "Switch app",
  panelClassName,
  attention = true,
}: BouncingAppSwitcherProps) {
  const [appsOpen, setAppsOpen] = useState(false);
  const [showAttention, setShowAttention] = useState(false);

  // Attention-grabbing bounce on first visit — continuous until the menu is
  // opened (and whenever it is closed again).
  useEffect(() => {
    if (attention) setShowAttention(true);
  }, [attention]);

  return (
    <DropdownMenu open={appsOpen} onOpenChange={setAppsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-haspopup="menu"
          aria-expanded={appsOpen}
          aria-label={label}
          className={cn(
            "animate-gentle-float cursor-pointer rounded-full border transition-colors duration-200",
            dark
              ? [
                  appsOpen
                    ? "border-[#C9A84C] bg-white/10 text-[#C9A84C]"
                    : "border-white/25 text-white/70 hover:bg-white/10 hover:text-white",
                ]
              : [
                  appsOpen
                    ? "border-gold bg-surface-container text-on-surface"
                    : "border-gold/50 text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                ],
            showAttention && !appsOpen && "animate-bounce-ball",
          )}
        >
          <span
            className={cn(
              "inline-flex",
              appsOpen ? "animate-bounce-rotate" : "rotate-0",
            )}
          >
            <ChevronDown className="size-4" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className={cn(
          "w-[300px] overflow-hidden rounded-2xl border border-outline-variant bg-surface p-0 shadow-xl data-[state=open]:animate-app-switcher-in data-[state=closed]:animate-app-switcher-out sm:w-[240px]",
          panelClassName,
        )}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { BouncingAppSwitcher };
export type { BouncingAppSwitcherProps };