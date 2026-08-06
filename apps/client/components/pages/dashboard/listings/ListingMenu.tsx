"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from "@repo/ui";
import { LISTING_MENU_ITEMS } from "./constants";

/**
 * Row `...` menu (DESIGN.md §5.2): Edit / View public page / Mark sold /
 * Archive / Duplicate.
 */
export function ListingMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Listing actions"
        >
          <Icon name="more_vert" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          {LISTING_MENU_ITEMS.map((item) =>
            item.href ? (
              <DropdownMenuItem
                key={item.label}
                variant={item.destructive ? "destructive" : "default"}
                asChild
              >
                <a href={item.href}>
                  <Icon name={item.icon} />
                  {item.label}
                </a>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                key={item.label}
                variant={item.destructive ? "destructive" : "default"}
              >
                <Icon name={item.icon} />
                {item.label}
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
