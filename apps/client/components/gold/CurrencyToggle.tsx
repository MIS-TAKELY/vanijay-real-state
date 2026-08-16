"use client";

import type { CurrencyCode } from "../../constants/gold/metals";
import { CURRENCY_SYMBOLS } from "../../constants/gold/metals";

interface CurrencyToggleProps {
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}

const CURRENCIES: CurrencyCode[] = ["NPR", "USD", "EUR", "GBP", "INR", "CNY"];

export function CurrencyToggle({
  currency,
  onCurrencyChange,
}: CurrencyToggleProps) {
  return (
    <div
      className="flex shrink-0 flex-wrap gap-0.5 rounded-full border border-white/[0.08] p-0.5"
      role="group"
      aria-label="Display currency"
    >
      {CURRENCIES.map((c) => (
        <button
          key={c}
          onClick={() => onCurrencyChange(c)}
          aria-pressed={currency === c}
          className={`
            rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors
            ${
              currency === c
                ? "bg-white/[0.12] text-[#E8E6E1]"
                : "text-white/40 hover:text-white/70"
            }
          `}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {CURRENCY_SYMBOLS[c]} {c}
        </button>
      ))}
    </div>
  );
}
