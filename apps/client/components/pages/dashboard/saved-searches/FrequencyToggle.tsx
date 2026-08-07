"use client";

import { ToggleGroup, ToggleGroupItem } from "@repo/ui";
import { useState } from "react";
import { FREQUENCY_OPTIONS, type AlertFrequency } from "./constants";

interface FrequencyToggleProps {
  value: AlertFrequency;
  onChange?: (value: AlertFrequency) => void;
}

export function FrequencyToggle({ value, onChange }: FrequencyToggleProps) {
  const [active, setActive] = useState<AlertFrequency>(value);

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
