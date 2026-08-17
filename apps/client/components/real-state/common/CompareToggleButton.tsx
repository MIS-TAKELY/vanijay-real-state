"use client";

import { Button, cn, Icon, toast } from "@repo/ui";
import type { CardProperty } from "lib/api/services/properties/types";
import { MAX_COMPARE_ITEMS, useCompareStore } from "store/compare";

interface CompareToggleButtonProps {
  property: CardProperty;
  /** Renders only the swap icon — used as a media overlay on property cards. */
  iconOnly?: boolean;
  /** Button size — only applies with `iconOnly`; `icon-xl` (44px) is the
   *  accessible tap target used in the card's action margin. */
  size?: "icon" | "icon-sm" | "icon-md" | "icon-lg" | "icon-xl";
  className?: string;
}

export function CompareToggleButton({
  property,
  iconOnly = false,
  size = "icon",
  className,
}: CompareToggleButtonProps) {
  const { add, remove, isSelected, items } = useCompareStore();
  const selected = isSelected(property.id);
  const atMax = items.length >= MAX_COMPARE_ITEMS;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selected) {
      remove(property.id);
      toast("Removed from comparison");
    } else {
      const added = add(property);
      if (!added) {
        toast(`You can compare up to ${MAX_COMPARE_ITEMS} properties`);
        return;
      }
      toast("Added to comparison");
    }
  };

  return (
    <Button
      variant="ghost"
      size={iconOnly ? size : "sm"}
      onClick={handleClick}
      disabled={!selected && atMax}
      aria-pressed={selected}
      aria-label={selected ? "Remove from comparison" : "Add to comparison"}
      className={cn(
        iconOnly
          ? "transition-colors"
          : "w-full rounded-md py-1.5 text-label-sm font-medium transition-colors",
        className,
        iconOnly &&
          (selected
            ? "bg-primary/15 text-primary hover:bg-primary/25"
            : "text-on-surface-variant"),
        !selected && atMax && "cursor-not-allowed opacity-40",
      )}
    >
      <Icon
        name={selected ? "check" : "swap_horiz"}
        className={cn(
          iconOnly ? "text-[18px]" : "mr-1.5 text-[14px]",
          selected && "text-primary",
        )}
      />
      {!iconOnly && (selected ? "Selected" : "Compare")}
    </Button>
  );
}
