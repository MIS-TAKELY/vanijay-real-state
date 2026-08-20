"use client";

import type { WeightUnit } from "../../constants/gold/metals";

interface UnitToggleProps {
  unit: WeightUnit;
  onUnitChange: (unit: WeightUnit) => void;
}

const UNITS: WeightUnit[] = ["oz", "gram", "kilo", "tola", "anna", "sukhi"];

export function UnitToggle({ unit, onUnitChange }: UnitToggleProps) {
  return (
    <div
      className="flex shrink-0 gap-0.5 rounded-full border border-white/[0.08] p-0.5"
      role="group"
      aria-label="Weight unit"
    >
      {UNITS.map((u) => (
        <button
          key={u}
          onClick={() => onUnitChange(u)}
          aria-pressed={unit === u}
          className={`
            rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-colors
            ${
              unit === u
                ? "bg-white/[0.12] text-[#E8E6E1]"
                : "text-white/40 hover:text-white/70"
            }
          `}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {u}
        </button>
      ))}
    </div>
  );
}
