"use client";

import {
  Checkbox,
  Input,
  Label,
  PROVINCES,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import type { WizardDraft } from "./SellerWizard";

interface StepDetailsProps {
  draft: WizardDraft;
  onPatch: (patch: Partial<WizardDraft>) => void;
}

const ALL_DISTRICTS = PROVINCES.flatMap((p) => p.districts.map((d) => d.name));

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-on-surface">
        {label}
        {optional && (
          <span className="ml-1.5 text-xs font-normal text-on-surface-variant">
            (optional)
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}

/**
 * Step 3 — the actual details, branched by account type. Individuals only see
 * one field; agents and organizations see their business fields with optional
 * ones clearly labeled.
 */
export function StepDetails({ draft, onPatch }: StepDetailsProps) {
  if (draft.accountType === "INDIVIDUAL") {
    return (
      <div className="flex flex-col gap-lg">
        <div className="flex flex-col gap-xs">
          <h3 className="text-lg font-semibold text-on-surface">
            Tell us who you are
          </h3>
          <p className="text-sm text-on-surface-variant">
            Just your full name, as it appears on your citizenship certificate.
          </p>
        </div>
        <Field label="Full name">
          <Input
            value={draft.fullName}
            onChange={(e) => onPatch({ fullName: e.target.value })}
            placeholder="e.g. Asha Shrestha"
            autoComplete="name"
            className="h-11 rounded-xl"
          />
        </Field>
      </div>
    );
  }

  const isOrganization = draft.accountType === "ORGANIZATION";

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h3 className="text-lg font-semibold text-on-surface">
          {isOrganization ? "Organization details" : "Agency details"}
        </h3>
        <p className="text-sm text-on-surface-variant">
          {isOrganization
            ? "Tell us about your organization and its authorized representative."
            : "Tell us about your agency and who will manage this account."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field label={isOrganization ? "Organization name" : "Agency name"}>
          <Input
            value={draft.businessName}
            onChange={(e) => onPatch({ businessName: e.target.value })}
            placeholder={
              isOrganization
                ? "e.g. Himalayan Homes Pvt. Ltd."
                : "e.g. Everest Realty"
            }
            className="h-11 rounded-xl"
          />
        </Field>

        <Field
          label={
            isOrganization
              ? "Authorized representative"
              : "Individual representative"
          }
        >
          <Input
            value={draft.representativeName}
            onChange={(e) => onPatch({ representativeName: e.target.value })}
            placeholder="Full name"
            autoComplete="name"
            className="h-11 rounded-xl"
          />
        </Field>
      </div>

      {/* Registration — "where applicable" */}
      <div className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container/40 p-md">
        <label className="flex items-start gap-sm">
          <Checkbox
            checked={draft.hasBusinessRegistration}
            onCheckedChange={(checked) =>
              onPatch({
                hasBusinessRegistration: checked === true,
                ...(checked !== true ? { registrationNumber: "" } : {}),
              })
            }
            className="mt-0.5"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-on-surface">
              We have a business registration
            </span>
            <span className="text-xs text-on-surface-variant">
              PAN/VAT or company registration, where applicable.
            </span>
          </span>
        </label>

        {draft.hasBusinessRegistration && (
          <Field label="Registration number (PAN/VAT)">
            <Input
              value={draft.registrationNumber}
              onChange={(e) => onPatch({ registrationNumber: e.target.value })}
              placeholder="e.g. 123456789"
              className="h-11 rounded-xl"
            />
          </Field>
        )}
      </div>

      {isOrganization && (
        <>
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <Field label="Business email">
              <Input
                type="email"
                value={draft.businessEmail}
                onChange={(e) => onPatch({ businessEmail: e.target.value })}
                placeholder="contact@example.com"
                autoComplete="email"
                className="h-11 rounded-xl"
              />
            </Field>

            <Field label="Business phone">
              <Input
                inputMode="tel"
                value={draft.businessPhone}
                onChange={(e) => onPatch({ businessPhone: e.target.value })}
                placeholder="e.g. +977 1-XXXXXXX"
                autoComplete="tel"
                className="h-11 rounded-xl"
              />
            </Field>
          </div>

          <Field label="Website" optional>
            <Input
              value={draft.website}
              onChange={(e) => onPatch({ website: e.target.value })}
              placeholder="https://…"
              className="h-11 rounded-xl"
            />
          </Field>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <Field label="Office district">
              <Select
                value={draft.officeDistrict || undefined}
                onValueChange={(value) => onPatch({ officeDistrict: value })}
              >
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Office address">
              <Input
                value={draft.officeAddress}
                onChange={(e) => onPatch({ officeAddress: e.target.value })}
                placeholder="Street, ward, municipality"
                className="h-11 rounded-xl"
              />
            </Field>
          </div>
        </>
      )}
    </div>
  );
}