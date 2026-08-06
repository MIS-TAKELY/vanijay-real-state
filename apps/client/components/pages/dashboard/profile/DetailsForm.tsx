"use client";

import { Icon, Input, Label, ToggleGroup, ToggleGroupItem } from "@repo/ui";
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
          <Label htmlFor="pf-district">Permanent district</Label>
          <Input
            id="pf-district"
            type="text"
            defaultValue={profile.permanentDistrict}
            className="h-11"
          />
        </div>

        {/* Permanent address */}
        <div className="flex flex-col gap-xs">
          <Label htmlFor="pf-address">Permanent address</Label>
          <Input
            id="pf-address"
            type="text"
            defaultValue={profile.permanentAddress}
            className="h-11"
          />
        </div>
      </div>

      {/* Preferred language toggle */}
      <div className="mt-md flex flex-col gap-xs">
        <Label>Preferred language</Label>
        <ToggleGroup
          type="single"
          value={language}
          onValueChange={(v) => {
            if (v) setLanguage(v as PreferredLanguage);
          }}
          variant="outline"
          aria-label="Preferred language"
          className="inline-flex w-fit items-center rounded-full border border-outline-variant bg-surface p-0.5"
        >
          {LANGUAGES.map((opt) => (
            <ToggleGroupItem
              key={opt.key}
              value={opt.key}
              aria-label={opt.label}
              className="rounded-full px-3 py-1 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-on-primary data-[state=off]:text-on-surface-variant data-[state=off]:hover:text-on-surface"
            >
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Preferred contact method radio */}
      <div className="mt-md flex flex-col gap-xs">
        <Label>Preferred contact method</Label>
        <ToggleGroup
          type="single"
          value={contact}
          onValueChange={(v) => {
            if (v) setContact(v as ContactMethod);
          }}
          variant="outline"
          aria-label="Preferred contact method"
          className="flex flex-wrap gap-sm"
        >
          {CONTACT_METHODS.map((opt) => (
            <ToggleGroupItem
              key={opt.key}
              value={opt.key}
              aria-label={opt.label}
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium data-[state=on]:border-primary data-[state=on]:bg-primary/5 data-[state=on]:text-primary data-[state=off]:border-outline-variant data-[state=off]:text-on-surface-variant data-[state=off]:hover:border-primary/40"
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
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
