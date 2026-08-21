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
      className="flex shrink-0 flex-nowrap gap-0.5 overflow-x-auto rounded-full border border-outline-variant bg-surface p-0.5 shadow-sm sm:flex-wrap sm:overflow-x-visible"
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
                ? "bg-gold text-on-gold shadow-sm"
                : "text-on-surface-variant hover:text-primary"
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