import Link from "next/link";
import { UNIT_RATE_UNITS } from "./UnitRateTemplate";

/**
 * Server-rendered chip-row of unit-rate page buttons (e.g. /gold/tola,
 * /gold/gram). Shown on the gold and silver market pages so users — and
 * crawlers — can reach every per-unit landing page in one hop.
 */
export function MetalUnitLinks({ metalId }: { metalId: "gold" | "silver" }) {
  return (
    <nav
      aria-label={`${metalId} rates by unit`}
      className="mb-6 flex flex-wrap items-center gap-2 sm:mb-10"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
        Rate by unit:
      </span>
      {UNIT_RATE_UNITS.map((u) => (
        <Link
          key={u.id}
          href={`/${metalId}/${u.id}`}
          className="rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-xs font-medium text-on-surface-variant shadow-sm transition-colors hover:border-gold/50 hover:text-primary"
        >
          Per {u.label}
          {u.nepali ? ` ${u.nepali}` : ""}
        </Link>
      ))}
    </nav>
  );
}