"use client";

import { cn, Icon } from "@repo/ui";
import { useState } from "react";
import { PROPERTY_TYPES } from "./constants";

const TITLE_MAX = 80;

export function StepBasics() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("RESIDENTIAL_LAND");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const priceNum = Number(price.replace(/[^0-9]/g, "")) || 0;
  const pricePerAana = priceNum > 0 ? Math.round(priceNum / 62).toLocaleString() : "—";

  return (
    <div className="flex flex-col gap-md">
      {/* Title + char counter */}
      <div className="flex flex-col gap-xs">
        <label
          htmlFor="w-title"
          className="font-label-sm text-[13px] font-semibold text-on-surface"
        >
          Title
        </label>
        <div className="relative">
          <input
            id="w-title"
            type="text"
            value={title}
            maxLength={TITLE_MAX}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bhaisepati Residential Land"
            className="h-11 w-full rounded-md border border-outline bg-surface px-3 pr-14 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
          <span className="mono-stat absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-on-surface-variant">
            {title.length}/{TITLE_MAX}
          </span>
        </div>
      </div>

      {/* Property type — 6 cards */}
      <div className="flex flex-col gap-xs">
        <span className="font-label-sm text-[13px] font-semibold text-on-surface">
          Property type
        </span>
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-3">
          {PROPERTY_TYPES.map((pt) => {
            const active = type === pt.key;
            return (
              <button
                key={pt.key}
                type="button"
                onClick={() => setType(pt.key)}
                className={cn(
                  "flex flex-col items-start gap-xs rounded-xl border p-sm text-left transition-colors cursor-pointer",
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-outline-variant bg-surface hover:border-primary/40",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    active ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant",
                  )}
                >
                  <Icon name={pt.icon} className="text-[20px]" />
                </span>
                <span className="text-sm font-medium text-on-surface">
                  {pt.label}
                </span>
                <span className="text-[11px] text-on-surface-variant">{pt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-xs">
        <label
          htmlFor="w-desc"
          className="font-label-sm text-[13px] font-semibold text-on-surface"
        >
          Description
        </label>
        <textarea
          id="w-desc"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the plot, access, nearby facilities, and verification highlights…"
          className="w-full rounded-md border border-outline bg-surface px-3 py-2 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
        />
      </div>

      {/* Asking price */}
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <label
            htmlFor="w-price"
            className="font-label-sm text-[13px] font-semibold text-on-surface"
          >
            Asking price (NPR)
          </label>
          <input
            id="w-price"
            type="text"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^0-9,]/g, ""))}
            placeholder="2,45,00,000"
            className="mono-stat h-11 w-full rounded-md border border-outline bg-surface px-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>
        <div className="flex items-end">
          <span className="inline-flex w-full items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-sm py-2.5 text-sm text-on-surface">
            <Icon name="calculate" className="text-[18px] text-primary" />
            <span className="text-on-surface-variant">≈ NPR</span>
            <span className="mono-stat font-bold text-primary">{pricePerAana}</span>
            <span className="text-on-surface-variant">/ aana</span>
          </span>
        </div>
      </div>
    </div>
  );
}
