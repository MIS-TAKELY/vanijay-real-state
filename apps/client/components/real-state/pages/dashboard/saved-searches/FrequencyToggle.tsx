"use client";

import { ToggleGroup, ToggleGroupItem } from "@repo/ui";
import { useEffect, useState } from "react";
import { FREQUENCY_OPTIONS, type AlertFrequency } from "./constants";

interface FrequencyToggleProps {
  value: AlertFrequency;
  onChange?: (value: AlertFrequency) => void;
  disabled?: boolean;
}

export function FrequencyToggle({
  value,
  onChange,
  disabled = false,
}: FrequencyToggleProps) {
  const [active, setActive] = useState<AlertFrequency>(value);

  // Stay in sync when the parent updates the persisted value (e.g. optimistic
  // update, or a different card re-renders this one).
  useEffect(() => {
    setActive(value);
  }, [value]);

  const handleSelect = (next: AlertFrequency) => {
    setActive(next);
    onChange?.(next);
  };

  return (
    <ToggleGroup
      type="single"
      value={active}
      onValueChange={(v) => {
        if (v) handleSelect(v as AlertFrequency);
      }}
      variant="outline"
      aria-label="Alert frequency"
      className="bg-surface p-0.5"
      disabled={disabled}
    >
      {FREQUENCY_OPTIONS.map((opt) => (
        <ToggleGroupItem
          key={opt.key}
          value={opt.key}
          aria-label={opt.label}
          className="rounded-full px-2.5 py-1 text-[12px] font-medium data-[state=on]:bg-primary data-[state=on]:text-on-primary data-[state=off]:text-on-surface-variant data-[state=off]:hover:text-on-surface"
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
