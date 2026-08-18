"use client";

import { useState, type ReactNode } from "react";

import {
  Icon,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import {
  BIGHA_SYSTEM,
  convertLand,
  decomposeSqFtToParts,
  formatLandNumber,
  GROUP_LABELS,
  isNepaliUnit,
  LAND_UNITS,
  landValuesFromSqFt,
  parseLandInput,
  PART_LABELS,
  partsToSqFt,
  QUICK_FACTS,
  ROPANI_SYSTEM,
  systemOf,
  type LandPartKey,
  type LandParts,
  type UnitGroup,
  type UnitKey,
  type UnitSystem,
} from "lib/land-units";

const GROUPS: UnitGroup[] = ["nepali-ropani", "nepali-bigha", "international"];
const ALL_PART_KEYS: LandPartKey[] = [...ROPANI_SYSTEM, ...BIGHA_SYSTEM];

/** International units shown as single inputs on the FROM side. */
type IntUnit = "sqft" | "sqm" | "acre" | "hectare";
const INT_UNITS: IntUnit[] = ["sqft", "sqm", "acre", "hectare"];

/** Unit system chosen in the FROM panel's dropdown. */
type FromSystem = "ropani" | "bigha" | "int";

/* Currency shown next to prices. Change here if the site ever deals in
   a currency other than Nepali Rupees. */
const CURRENCY_SYMBOL = "Rs";

const unitLabel = (key: UnitKey): string =>
  LAND_UNITS.find((u) => u.key === key)?.label ?? key;

/** Raw string values keyed by part, as typed by the user. */
type PartInputs = Record<LandPartKey, string>;

/** Numbers for a set of part inputs (empty/invalid → 0). */
function parseParts(parts: PartInputs): LandParts {
  const out: LandParts = {};
  for (const key of ALL_PART_KEYS) {
    const n = parseLandInput(parts[key] ?? "");
    out[key] = Number.isFinite(n) ? n : 0;
  }
  return out;
}

/** Convert numeric land parts into raw string fields for the inputs. */
function partsToInputs(parts: LandParts): PartInputs {
  const out: PartInputs = {
    ropani: "",
    aana: "",
    paisa: "",
    daam: "",
    bigha: "",
    katha: "",
    dhur: "",
  };
  for (const key of ALL_PART_KEYS) {
    const v = parts[key];
    out[key] = v == null ? "" : String(v);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Money formatting (Indian/Nepali lakh-crore digit grouping)         */
/* ------------------------------------------------------------------ */

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

function formatMoney(n: number): string {
  return Number.isFinite(n) ? moneyFormatter.format(n) : "";
}

/* ------------------------------------------------------------------ */
/*  Small inputs                                                       */
/* ------------------------------------------------------------------ */

function PartField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant"
      >
        {label}
      </label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mono-stat h-11 rounded-lg border-outline-variant bg-surface px-3 text-base font-semibold text-on-surface transition-[border-color,box-shadow] duration-200 focus-visible:ring-[3px] focus-visible:border-primary focus-visible:ring-primary/25"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Grouped unit selector                                              */
/* ------------------------------------------------------------------ */

function UnitOptions() {
  return (
    <>
      {GROUPS.map((group) => (
        <SelectGroup key={group}>
          <SelectLabel>{GROUP_LABELS[group]}</SelectLabel>
          {LAND_UNITS.filter((u) => u.group === group).map((u) => (
            <SelectItem key={u.key} value={u.key}>
              <span className="font-medium">{u.label}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      ))}
    </>
  );
}

function UnitSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children?: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant"
      >
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          aria-label={`${label} unit`}
          className="w-full cursor-pointer justify-between border-outline-variant bg-surface px-3 font-medium text-on-surface data-[placeholder]:text-on-surface-variant"
        >
          <SelectValue placeholder="Choose a unit" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {children ?? <UnitOptions />}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section eyebrow (gold hairline + label, per design system)         */
/* ------------------------------------------------------------------ */

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-deep">
      <span aria-hidden="true" className="h-px w-7 bg-gold" />
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  FROM panel — your land in every unit + total selling price         */
/* ------------------------------------------------------------------ */

function FromPanel({
  system,
  parts,
  intValues,
  price,
  onChangeSystem,
  onPartChange,
  onIntChange,
  onChangePrice,
  onReset,
}: {
  system: FromSystem;
  parts: PartInputs;
  intValues: Record<IntUnit, string>;
  price: string;
  onChangeSystem: (system: FromSystem) => void;
  onPartChange: (key: LandPartKey, text: string) => void;
  onIntChange: (unit: IntUnit, text: string) => void;
  onChangePrice: (text: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 transition-shadow duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary"
          >
            1
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
            Your land
          </span>
        </span>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-medium text-on-surface-variant transition-colors duration-150 hover:bg-primary/10 hover:text-primary"
        >
          <Icon name="history" className="text-[14px]" />
          Reset
        </button>
      </div>

      <UnitSelect
        id="convertor-from-system"
        label="Unit system"
        value={system}
        onChange={(v) => onChangeSystem(v as FromSystem)}
      >
        <SelectItem value="ropani">Ropani system</SelectItem>
        <SelectItem value="bigha">Bigha system</SelectItem>
        <SelectItem value="int">International</SelectItem>
      </UnitSelect>

      <span className="mt-4 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
        Land area
      </span>

      {system === "ropani" && (
        <div className="mt-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ROPANI_SYSTEM.map((key) => (
              <PartField
                key={key}
                id={`convertor-from-${key}`}
                label={PART_LABELS[key]}
                value={(parts[key] ?? "").toString()}
                onChange={(text) => onPartChange(key, text)}
              />
            ))}
          </div>
        </div>
      )}

      {system === "bigha" && (
        <div className="mt-2">
          <div className="grid grid-cols-3 gap-2">
            {BIGHA_SYSTEM.map((key) => (
              <PartField
                key={key}
                id={`convertor-from-${key}`}
                label={PART_LABELS[key]}
                value={(parts[key] ?? "").toString()}
                onChange={(text) => onPartChange(key, text)}
              />
            ))}
          </div>
        </div>
      )}

      {system === "int" && (
        <div className="mt-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {INT_UNITS.map((unit) => (
              <PartField
                key={unit}
                id={`convertor-from-${unit}`}
                label={unitLabel(unit)}
                value={intValues[unit]}
                onChange={(text) => onIntChange(unit, text)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Total selling price — the whole land */}
      <div className="mt-4 border-t border-outline-variant/70 pt-4">
        <label
          htmlFor="convertor-from-price"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant"
        >
          I want to sell this land for
        </label>
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="shrink-0 text-sm font-semibold text-on-surface-variant"
          >
            {CURRENCY_SYMBOL}
          </span>
          <Input
            id="convertor-from-price"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder="5,00,000"
            value={price}
            onChange={(e) => onChangePrice(e.target.value)}
            className="mono-stat h-11 min-w-0 flex-1 rounded-lg border-outline-variant bg-surface px-3 text-base font-semibold text-on-surface transition-[border-color,box-shadow] duration-200 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/25"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TO panel — converted area + converted price + total                */
/* ------------------------------------------------------------------ */

function ToPanel({
  unit,
  value,
  price,
  onChangeUnit,
  onChangeValue,
  onChangePrice,
  onCopy,
  copied,
}: {
  unit: UnitKey;
  value: string;
  price: string;
  onChangeUnit: (unit: UnitKey) => void;
  onChangeValue: (text: string) => void;
  onChangePrice: (text: string) => void;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 transition-shadow duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary"
          >
            2
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
            Money per unit
          </span>
        </span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            aria-label="Copy converted value"
            className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-medium text-on-surface-variant transition-colors duration-150 hover:bg-primary/10 hover:text-primary"
          >
            <Icon name="content_copy" className="text-[14px]" />
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      <UnitSelect
        id="convertor-to-unit"
        label="Unit"
        value={unit}
        onChange={(v) => onChangeUnit(v as UnitKey)}
      />

      <label
        htmlFor="convertor-to-value"
        className="mt-4 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant"
      >
        Land area
      </label>
      <Input
        id="convertor-to-value"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        placeholder="0"
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        className="mono-stat h-14 rounded-lg border-outline-variant bg-surface px-4 text-xl font-semibold text-on-surface shadow-sm transition-[border-color,box-shadow] duration-200 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/25 md:text-2xl"
      />

      {/* Money you get for one unit of the chosen unit — the answer */}
      <div
        aria-live="polite"
        className="mt-4 rounded-lg border-t-2 border-gold/50 pt-4"
      >
        <label
          htmlFor="convertor-to-price"
          className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-gold"
          />
          Money you get per {unitLabel(unit)}
        </label>
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="shrink-0 text-sm font-semibold text-gold-deep"
          >
            {CURRENCY_SYMBOL}
          </span>
          <Input
            id="convertor-to-price"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder="—"
            value={price}
            onChange={(e) => onChangePrice(e.target.value)}
            className="mono-stat h-12 min-w-0 flex-1 rounded-lg border-gold/50 bg-surface px-3 text-lg font-bold text-gold-deep transition-[border-color,box-shadow] duration-200 focus-visible:border-gold focus-visible:ring-[3px] focus-visible:ring-gold/25"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main converter                                                     */
/* ------------------------------------------------------------------ */

/**
 * Whole-component state lives in a single base area measured in sq ft,
 * plus a single base price rate measured per sq ft. Whichever field the
 * user last edited (on the left or the right) is the "source of truth",
 * so editing anything keeps all the other fields in sync.
 *
 * The FROM side shows every unit at once — Ropani / Aana / Paisa / Daam,
 * Bigha / Katha / Dhur and the international units — and all of them stay
 * in sync with whatever the user typed last.
 */
export function ConvertorClient() {
  const [toUnit, setToUnit] = useState<UnitKey>("sqft");
  const [toValue, setToValue] = useState(
    formatLandNumber(convertLand(1, "aana", "sqft")),
  );

  // Every unit on the FROM side — raw string values as typed.
  const [fromParts, setFromParts] = useState<PartInputs>(
    partsToInputs({
      ...decomposeSqFtToParts(convertLand(1, "aana", "sqft"), "ROPANI"),
      ...decomposeSqFtToParts(convertLand(1, "aana", "sqft"), "BIGHA"),
    }),
  );
  const [intValues, setIntValues] = useState<Record<IntUnit, string>>({
    sqft: formatLandNumber(convertLand(1, "aana", "sqft")),
    sqm: formatLandNumber(convertLand(1, "aana", "sqm")),
    acre: formatLandNumber(convertLand(1, "aana", "acre")),
    hectare: formatLandNumber(convertLand(1, "aana", "hectare")),
  });
  const [fromSource, setFromSource] = useState<"ropani" | "bigha" | IntUnit>(
    "ropani",
  );
  // Which unit system the FROM panel shows in its dropdown.
  const [fromSystem, setFromSystem] = useState<FromSystem>("ropani");

  const [lastEdited, setLastEdited] = useState<"from" | "to">("from");
  const [copied, setCopied] = useState(false);

  // Selling price. The FROM side stores the TOTAL price for the whole
  // land; the TO side shows that same rate expressed per toUnit. Both are
  // editable — editing either keeps the other in sync.
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");

  /** Sq ft of one Nepali system's parts only (avoids double counting). */
  const systemSqFt = (system: UnitSystem): number => {
    const parts = parseParts(fromParts);
    const clean: LandParts = {};
    for (const key of system === "BIGHA" ? BIGHA_SYSTEM : ROPANI_SYSTEM) {
      clean[key] = parts[key];
    }
    return partsToSqFt(clean);
  };

  /** Exact sq ft of whatever was last edited on the FROM side. */
  const fromSqFt =
    fromSource === "ropani"
      ? systemSqFt("ROPANI")
      : fromSource === "bigha"
        ? systemSqFt("BIGHA")
        : convertLand(
            parseLandInput(intValues[fromSource]),
            fromSource,
            "sqft",
          );

  // Base area (sq ft) is driven by whichever side was last edited.
  const baseSqFt =
    lastEdited === "from"
      ? fromSqFt
      : convertLand(parseLandInput(toValue), toUnit, "sqft");
  const hasValue = Number.isFinite(baseSqFt) && baseSqFt >= 0;
  const rows = landValuesFromSqFt(hasValue ? baseSqFt : 0);

  // Canonical rate: price per sq ft. The FROM side stores the total price
  // for the whole land, so the rate is total ÷ area; when only the TO side
  // has a price we fall back to that expressed per sq ft.
  const totalPriceNum = parseLandInput(priceFrom);
  const pricePerSqFt =
    Number.isFinite(totalPriceNum) && totalPriceNum > 0 && baseSqFt > 0
      ? totalPriceNum / baseSqFt
      : parseLandInput(priceTo) / convertLand(1, toUnit, "sqft");
  const hasPrice = Number.isFinite(pricePerSqFt) && pricePerSqFt > 0;

  /* ------------------------------ sync helpers -------------------- */

  const syncToFrom = (sqft: number) => {
    if (!Number.isFinite(sqft)) {
      setToValue("");
      return;
    }
    setToValue(formatLandNumber(convertLand(sqft, "sqft", toUnit)));
  };

  /** Recompute the TO-side price for a given per-sq-ft rate and unit. */
  const priceTextFor = (perSqFt: number, unit: UnitKey): string =>
    Number.isFinite(perSqFt) && perSqFt > 0
      ? formatMoney(perSqFt * convertLand(1, unit, "sqft"))
      : "";

  /** Update the TO-side per-unit price after the area changes. */
  const syncPriceTo = (sqft: number) => {
    const total = parseLandInput(priceFrom);
    if (Number.isFinite(total) && total > 0 && sqft > 0) {
      setPriceTo(priceTextFor(total / sqft, toUnit));
    } else if (!Number.isFinite(sqft) || sqft <= 0) {
      setPriceTo("");
    }
  };

  /**
   * Keep every unit field in sync with the given area (sq ft). A
   * non-positive / invalid area clears all the fields.
   */
  const syncAllFrom = (sqft: number) => {
    if (!Number.isFinite(sqft) || sqft <= 0) {
      setFromParts(partsToInputs({}));
      setIntValues({ sqft: "", sqm: "", acre: "", hectare: "" });
      setToValue("");
      setPriceTo("");
      return;
    }
    setFromParts(
      partsToInputs({
        ...decomposeSqFtToParts(sqft, "ROPANI"),
        ...decomposeSqFtToParts(sqft, "BIGHA"),
      }),
    );
    setIntValues({
      sqft: formatLandNumber(convertLand(sqft, "sqft", "sqft")),
      sqm: formatLandNumber(convertLand(sqft, "sqft", "sqm")),
      acre: formatLandNumber(convertLand(sqft, "sqft", "acre")),
      hectare: formatLandNumber(convertLand(sqft, "sqft", "hectare")),
    });
    syncToFrom(sqft);
    syncPriceTo(sqft);
  };

  /* ------------------------------ area handlers ------------------- */

  const handlePartChange = (key: LandPartKey, text: string) => {
    const next: PartInputs = { ...fromParts, [key]: text };
    setFromParts(next);
    const system: UnitSystem =
      key === "bigha" || key === "katha" || key === "dhur" ? "BIGHA" : "ROPANI";
    setFromSource(system === "BIGHA" ? "bigha" : "ropani");
    setLastEdited("from");
    const parsed = parseParts(next);
    const clean: LandParts = {};
    for (const k of system === "BIGHA" ? BIGHA_SYSTEM : ROPANI_SYSTEM) {
      clean[k] = parsed[k];
    }
    syncAllFrom(partsToSqFt(clean));
  };

  const handleIntChange = (unit: IntUnit, text: string) => {
    setIntValues((v) => ({ ...v, [unit]: text }));
    setFromSource(unit);
    setLastEdited("from");
    syncAllFrom(convertLand(parseLandInput(text), unit, "sqft"));
  };

  const handleSystemChange = (system: FromSystem) => {
    setFromSystem(system);
    // Show the same (already synced) area in the newly chosen system.
    setFromSource(system === "int" ? "sqft" : system);
  };

  const handleToChange = (text: string) => {
    setToValue(text);
    setLastEdited("to");
    syncAllFrom(convertLand(parseLandInput(text), toUnit, "sqft"));
  };

  /* ------------------------------ price handlers ------------------ */

  const handlePriceFromChange = (text: string) => {
    setPriceFrom(text);
    const n = parseLandInput(text);
    if (!Number.isFinite(n) || n <= 0 || !(baseSqFt > 0)) {
      setPriceTo("");
      return;
    }
    setPriceTo(priceTextFor(n / baseSqFt, toUnit));
  };

  const handlePriceToChange = (text: string) => {
    setPriceTo(text);
    const n = parseLandInput(text);
    if (!Number.isFinite(n) || n <= 0 || !(baseSqFt > 0)) {
      setPriceFrom("");
      return;
    }
    setPriceFrom(formatMoney((n / convertLand(1, toUnit, "sqft")) * baseSqFt));
  };

  /* ------------------------------ unit handlers ------------------- */

  const handleToUnitChange = (unit: UnitKey) => {
    const base =
      lastEdited === "from"
        ? fromSqFt
        : convertLand(parseLandInput(toValue), toUnit, "sqft");
    setToUnit(unit);
    if (Number.isFinite(base)) {
      setToValue(formatLandNumber(convertLand(base, "sqft", unit)));
    }
    // Re-express the TO-side price per the newly selected unit.
    if (hasPrice) {
      setPriceTo(formatMoney(pricePerSqFt * convertLand(1, unit, "sqft")));
    }
  };

  const handleReset = () => {
    setToValue("");
    setFromParts(partsToInputs({}));
    setIntValues({ sqft: "", sqm: "", acre: "", hectare: "" });
    setPriceFrom("");
    setPriceTo("");
    setLastEdited("from");
    setCopied(false);
  };

  const applyFact = (from: UnitKey, to: UnitKey) => {
    const sqft = convertLand(1, from, "sqft");
    setToUnit(to);
    setLastEdited("from");
    if (isNepaliUnit(from)) {
      const system: FromSystem =
        systemOf(from) === "BIGHA" ? "bigha" : "ropani";
      setFromSystem(system);
      setFromSource(system);
    } else {
      setFromSystem("int");
      setFromSource(from as IntUnit);
    }
    syncAllFrom(sqft);
    setToValue(formatLandNumber(convertLand(sqft, "sqft", to)));
    if (hasPrice) {
      setPriceTo(formatMoney(pricePerSqFt * convertLand(1, to, "sqft")));
    }
    setCopied(false);
  };

  const handleCopy = async () => {
    const text = toValue.trim() ? toValue + " " + unitLabel(toUnit) : "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — leave silently */
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* ── Converter card ─────────────────────────────────────────── */}
        <div className="flex flex-col justify-between rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-6 lg:col-span-7 xl:col-span-7">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-2">
            <FromPanel
              system={fromSystem}
              parts={fromParts}
              intValues={intValues}
              price={priceFrom}
              onChangeSystem={handleSystemChange}
              onPartChange={handlePartChange}
              onIntChange={handleIntChange}
              onChangePrice={handlePriceFromChange}
              onReset={handleReset}
            />

            <div
              aria-hidden="true"
              className="hidden items-center justify-center sm:flex"
            >
              <Icon
                name="arrow_forward"
                className="text-xl text-gold transition-transform duration-200"
              />
            </div>

            <ToPanel
              unit={toUnit}
              value={toValue}
              price={priceTo}
              onChangeUnit={handleToUnitChange}
              onChangeValue={handleToChange}
              onChangePrice={handlePriceToChange}
              onCopy={handleCopy}
              copied={copied}
            />
          </div>
        </div>

        {/* ── Same area in every unit ────────────────────────────────── */}
        <section
          aria-label="Your area in every unit"
          className="flex flex-col justify-between rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-6 lg:col-span-5 xl:col-span-5"
        >
          <div>
            <SectionEyebrow>Quick reference</SectionEyebrow>
            <h2 className="font-display text-lg font-semibold text-navy sm:text-xl">
              Your area in every unit
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              The total above, expressed in every supported unit — including the
              exact Ropani / Aana / Paisa / Daam (or Bigha / Katha / Dhur)
              breakdown.
            </p>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {rows.map(({ unit, value }) => {
              const active = unit.key === toUnit;
              return (
                <li
                  key={unit.key}
                  className={
                    "rounded-lg border px-3 py-2.5 transition-colors duration-150 " +
                    (active
                      ? "border-gold/50 bg-gold-soft/40"
                      : "border-outline-variant bg-surface-container-low")
                  }
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-on-surface-variant">
                      {unit.label}
                    </span>
                    <span className="mono-stat truncate text-right text-sm font-semibold text-on-surface">
                      {formatLandNumber(value)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* ── Same rate in every unit (only when a price is entered) ── */}
      {hasPrice && (
        <section
          aria-label="Your rate in every unit"
          className="mx-auto mt-6 max-w-3xl rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-6"
        >
          <SectionEyebrow>Pricing</SectionEyebrow>
          <h2 className="font-display text-lg font-semibold text-navy sm:text-xl">
            Money you get per unit in every unit
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            <span className="mono-stat font-semibold text-gold-deep">
              {CURRENCY_SYMBOL}{" "}
              {formatMoney(pricePerSqFt * convertLand(1, toUnit, "sqft"))}
            </span>{" "}
            per {unitLabel(toUnit)}, expressed as money per each unit.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {rows.map(({ unit }) => {
              const perUnit = pricePerSqFt * convertLand(1, unit.key, "sqft");
              const active = unit.key === toUnit;
              return (
                <li
                  key={unit.key}
                  className={
                    "rounded-lg border px-3 py-2.5 transition-colors duration-150 " +
                    (active
                      ? "border-gold/50 bg-gold-soft/40"
                      : "border-outline-variant bg-surface-container-low")
                  }
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-on-surface-variant">
                      per {unit.label}
                    </span>
                    <span className="mono-stat truncate text-right text-sm font-semibold text-gold-deep">
                      {CURRENCY_SYMBOL} {formatMoney(perUnit)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── Common conversions (one tap) ───────────────────────────── */}
      <section
        aria-label="Common conversions"
        className="mx-auto mt-6 max-w-3xl rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-6"
      >
        <SectionEyebrow>One-tap conversions</SectionEyebrow>
        <h2 className="font-display text-lg font-semibold text-navy sm:text-xl">
          Common conversions
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Tap any card to load that conversion instantly.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUICK_FACTS.map(({ from, to }) => {
            const isActive = toUnit === to;
            return (
              <button
                key={from + "-" + to}
                type="button"
                onClick={() => applyFact(from, to)}
                aria-pressed={isActive}
                className={
                  "flex min-h-14 cursor-pointer flex-col items-start justify-center rounded-lg border px-3 py-2 text-left transition-all duration-150 " +
                  (isActive
                    ? "border-gold bg-gold-soft/50 shadow-sm"
                    : "border-outline-variant bg-surface-container-low hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]")
                }
              >
                <span className="text-[11px] font-medium text-on-surface-variant">
                  {"1 " + unitLabel(from) + " ="}
                </span>
                <span className="mono-stat w-full truncate text-sm font-semibold text-navy">
                  {formatLandNumber(convertLand(1, from, to))} {unitLabel(to)}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
