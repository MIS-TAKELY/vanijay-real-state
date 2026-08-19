"use client";

import { Icon } from "@repo/ui";
import type { SellerProfileView } from "lib/api/services/seller";
import { getAccountType, getSubTypeLabel } from "./constants";
import type { WizardDraft } from "./SellerWizard";

interface StepReviewProps {
  draft: WizardDraft;
  requirements: SellerProfileView["requirements"];
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-md py-2">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-right text-sm font-medium text-on-surface">
        {value}
      </span>
    </div>
  );
}

/**
 * Step 5 — a calm summary of everything provided before submission.
 */
export function StepReview({ draft, requirements }: StepReviewProps) {
  const type = getAccountType(draft.accountType);
  const subTypeLabel = getSubTypeLabel(draft.accountType, draft.subType);
  const isIndividual = draft.accountType === "INDIVIDUAL";
  const isOrganization = draft.accountType === "ORGANIZATION";

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h3 className="text-lg font-semibold text-on-surface">
          Review your application
        </h3>
        <p className="text-sm text-on-surface-variant">
          Check everything looks right, then submit. You can go back to edit.
        </p>
      </div>

      <div className="divide-y divide-outline-variant rounded-xl border border-outline-variant bg-surface px-md">
        <Row label="Account type" value={type?.label ?? ""} />
        <Row label="Category" value={subTypeLabel} />
        {isIndividual ? (
          <Row label="Full name" value={draft.fullName} />
        ) : (
          <>
            <Row
              label={isOrganization ? "Organization name" : "Agency name"}
              value={draft.businessName}
            />
            <Row
              label={
                isOrganization
                  ? "Authorized representative"
                  : "Individual representative"
              }
              value={draft.representativeName}
            />
            {draft.hasBusinessRegistration && (
              <Row label="Registration number" value={draft.registrationNumber} />
            )}
            {isOrganization && (
              <>
                <Row label="Business email" value={draft.businessEmail} />
                <Row label="Business phone" value={draft.businessPhone} />
                <Row label="Website" value={draft.website} />
                <Row label="Office district" value={draft.officeDistrict} />
                <Row label="Office address" value={draft.officeAddress} />
              </>
            )}
          </>
        )}
        <Row
          label="Declaration"
          value={draft.ownershipDeclared ? "Accepted" : "Not accepted"}
        />
      </div>

      {/* Verification status */}
      <div className="flex flex-col gap-xs rounded-xl border border-outline-variant bg-surface-container/40 p-md">
        <p className="text-sm font-medium text-on-surface">Contact verification</p>
        <div className="flex flex-wrap gap-md">
          <span className="flex items-center gap-1 text-xs text-on-surface-variant">
            <Icon
              name={requirements.emailVerified ? "check_circle" : "cancel"}
              className={
                requirements.emailVerified ? "text-data-price" : "text-data-table"
              }
            />
            Email {requirements.emailVerified ? "verified" : "not verified"}
          </span>
          <span className="flex items-center gap-1 text-xs text-on-surface-variant">
            <Icon
              name={requirements.phoneVerified ? "check_circle" : "cancel"}
              className={
                requirements.phoneVerified ? "text-data-price" : "text-data-table"
              }
            />
            Phone {requirements.phoneVerified ? "verified" : "not verified"}
          </span>
        </div>
      </div>
    </div>
  );
}