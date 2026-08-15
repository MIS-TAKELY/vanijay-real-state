"use client";

import { Button, Icon, toast } from "@repo/ui";
import { cn } from "@repo/ui";
import { useCompareStore, MAX_COMPARE_ITEMS } from "store/compare";
import type { CardProperty } from "lib/api/services/properties/types";

interface CompareToggleButtonProps {
  property: CardProperty;
  /** Renders only the swap icon — used as a media overlay on property cards. */
  iconOnly?: boolean;
  className?: string;
}

export function CompareToggleButton({ property, iconOnly = false, className }: CompareToggleButtonProps) {
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
      size={iconOnly ? "icon" : "sm"}
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
        (!selected && atMax) && "cursor-not-allowed opacity-40",
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
