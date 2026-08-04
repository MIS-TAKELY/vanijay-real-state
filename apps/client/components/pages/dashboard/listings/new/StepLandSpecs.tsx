"use client";

import { cn } from "@repo/ui";
import { useMemo, useState } from "react";
import {
  BIGHA_PARTS,
  FACING_DIRECTIONS,
  ROAD_TYPES,
  ROPANI_PARTS,
  UNIT_SYSTEMS,
  type UnitSystem,
} from "./constants";

const FIELD =
  "h-11 w-full rounded-md border border-outline bg-surface px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors";

export function StepLandSpecs() {
  const [system, setSystem] = useState<UnitSystem>("ROPANI");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [roadType, setRoadType] = useState("");
  const [roadWidth, setRoadWidth] = useState("");
  const [facing, setFacing] = useState("");
  const [corner, setCorner] = useState(false);

  const parts = system === "ROPANI" ? ROPANI_PARTS : BIGHA_PARTS;

  const sqft = useMemo(() => {
    const nums = parts.map((p) => Number(vals[p.key]) || 0);
    if (system === "ROPANI") {
      const [ropani = 0, aana = 0, paisa = 0, daam = 0] = nums;
      const totalAana = ropani * 16 + aana + paisa / 4 + daam / 16;
      return Math.round(totalAana * 342.25);
    }
    const [bigha = 0, katha = 0, dhur = 0] = nums;
    const totalKatha = bigha * 20 + katha + dhur / 20;
    return Math.round(totalKatha * 364.5);
  }, [parts, system, vals]);

  const sqm = Math.round(sqft * 0.092903);

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <span className="font-label-sm text-[13px] font-semibold text-on-surface">Unit system</span>
        <div className="inline-flex w-fit items-center rounded-full border border-outline-variant bg-surface p-0.5">
          {UNIT_SYSTEMS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => { setSystem(opt.key); setVals({}); }}
              className={cn(
                "rounded-full px-3 py-1 text-[13px] font-medium transition-colors cursor-pointer",
                system === opt.key ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-sm sm:grid-cols-3">
        {parts.map((p) => (
          <div key={p.key} className="flex flex-col gap-xs">
            <label className="font-label-sm text-[13px] font-semibold text-on-surface">{p.unit}</label>
            <input
              type="text"
              inputMode="numeric"
              value={vals[p.key] ?? ""}
              onChange={(e) => setVals({ ...vals, [p.key]: e.target.value.replace(/[^0-9.]/g, "") })}
              placeholder="0"
              className={FIELD}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-sm rounded-xl border border-primary/30 bg-primary/5 p-sm">
        <span className="mono-stat text-lg font-bold text-primary">{sqft.toLocaleString()} sq.ft</span>
        <span className="mono-stat text-lg font-bold text-primary border-l border-primary/20 pl-sm">{sqm.toLocaleString()} sq.m</span>
      </div>

      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-[13px] font-semibold text-on-surface">Road type</label>
          <select className={FIELD} value={roadType} onChange={(e) => setRoadType(e.target.value)}>
            <option value="">Select road type</option>
            {ROAD_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-[13px] font-semibold text-on-surface">Road width (ft)</label>
          <input
            type="text"
            inputMode="numeric"
            value={roadWidth}
            onChange={(e) => setRoadWidth(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="e.g. 20"
            className={`mono-stat ${FIELD}`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-xs">
        <span className="font-label-sm text-[13px] font-semibold text-on-surface">Facing</span>
        <div className="flex flex-wrap gap-sm">
          {FACING_DIRECTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setFacing(d)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors cursor-pointer",
                facing === d ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary/40",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setCorner((v) => !v)}
        className="flex w-fit items-center gap-sm text-sm text-on-surface hover:text-on-surface-variant transition-colors cursor-pointer"
      >
        <span className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", corner ? "bg-primary" : "bg-surface-container-high")}>
          <span className={cn("inline-block h-5 w-5 transform rounded-full bg-surface shadow transition-transform", corner ? "translate-x-5" : "translate-x-0.5")} />
        </span>
        Corner plot
      </button>
    </div>
  );
}
