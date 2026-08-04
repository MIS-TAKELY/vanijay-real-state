"use client";

import { cn } from "@repo/ui";
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
    <div
      role="radiogroup"
      aria-label="Alert frequency"
      className="inline-flex items-center rounded-full border border-outline-variant bg-surface p-0.5"
    >
      {FREQUENCY_OPTIONS.map((opt) => {
        const isActive = active === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => handleSelect(opt.key)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors cursor-pointer",
              isActive
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
