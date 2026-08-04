"use client";

import { cn, Icon } from "@repo/ui";
import { useState } from "react";
import {
  CONTACT_METHODS,
  LANGUAGES,
  type ContactMethod,
  type PreferredLanguage,
  type ProfileData,
} from "./constants";

interface DetailsFormProps {
  profile: ProfileData;
}

export function DetailsForm({ profile }: DetailsFormProps) {
  const [language, setLanguage] = useState<PreferredLanguage>(
    profile.preferredLanguage,
  );
  const [contact, setContact] = useState<ContactMethod>(
    profile.preferredContactMethod,
  );

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-md">
      <h2 className="mb-md font-headline-md text-base font-semibold text-on-surface">
        Details
      </h2>

      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        {/* Permanent district */}
        <div className="flex flex-col gap-xs">
          <label
            htmlFor="pf-district"
            className="font-label-sm text-label-sm font-semibold text-on-surface"
          >
            Permanent district
          </label>
          <input
            id="pf-district"
            type="text"
            defaultValue={profile.permanentDistrict}
            className="h-11 rounded-md border border-outline bg-surface px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>

        {/* Permanent address */}
        <div className="flex flex-col gap-xs">
          <label
            htmlFor="pf-address"
            className="font-label-sm text-label-sm font-semibold text-on-surface"
          >
            Permanent address
          </label>
          <input
            id="pf-address"
            type="text"
            defaultValue={profile.permanentAddress}
            className="h-11 rounded-md border border-outline bg-surface px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>
      </div>

      {/* Preferred language toggle */}
      <div className="mt-md flex flex-col gap-xs">
        <span className="font-label-sm text-label-sm font-semibold text-on-surface">
          Preferred language
        </span>
        <div
          role="radiogroup"
          aria-label="Preferred language"
          className="inline-flex w-fit items-center rounded-full border border-outline-variant bg-surface p-0.5"
        >
          {LANGUAGES.map((opt) => {
            const isActive = language === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setLanguage(opt.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer",
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
      </div>

      {/* Preferred contact method radio */}
      <div className="mt-md flex flex-col gap-xs">
        <span className="font-label-sm text-label-sm font-semibold text-on-surface">
          Preferred contact method
        </span>
        <div className="flex flex-wrap gap-sm">
          {CONTACT_METHODS.map((opt) => {
            const isActive = contact === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setContact(opt.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-outline-variant text-on-surface-variant hover:border-primary/40",
                )}
              >
                <Icon
                  name={
                    opt.key === "PHONE"
                      ? "phone"
                      : opt.key === "WHATSAPP"
                        ? "chat"
                        : "message"
                  }
                  className="text-data-table"
                />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
