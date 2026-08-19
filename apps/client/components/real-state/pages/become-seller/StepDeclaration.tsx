"use client";

import { Checkbox, Icon } from "@repo/ui";
import { OWNERSHIP_DECLARATION_TEXT } from "./constants";
import type { WizardDraft } from "./SellerWizard";

interface StepDeclarationProps {
  draft: WizardDraft;
  onPatch: (patch: Partial<WizardDraft>) => void;
}

/**
 * Step 4 — the declaration. Individuals confirm ownership; agents and
 * organizations confirm their details are accurate. One checkbox, no noise.
 */
export function StepDeclaration({ draft, onPatch }: StepDeclarationProps) {
  const isIndividual = draft.accountType === "INDIVIDUAL";

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h3 className="text-lg font-semibold text-on-surface">
          {isIndividual ? "Ownership declaration" : "Confirm your details"}
        </h3>
        <p className="text-sm text-on-surface-variant">
          {isIndividual
            ? "Please read and accept the declaration below."
            : "Please confirm the information you provided is accurate."}
        </p>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container/40 p-md">
        <p className="text-sm leading-6 text-on-surface">
          {isIndividual
            ? OWNERSHIP_DECLARATION_TEXT
            : "I confirm that the details provided for this account are accurate " +
              "and that I am authorized to register and manage this account on " +
              "behalf of the organization or agency named above."}
        </p>
      </div>

      <label className="flex items-start gap-sm rounded-xl border border-outline-variant bg-surface p-md">
        <Checkbox
          checked={draft.ownershipDeclared}
          onCheckedChange={(checked) =>
            onPatch({ ownershipDeclared: checked === true })
          }
          className="mt-0.5"
        />
        <span className="text-sm font-medium text-on-surface">
          {isIndividual
            ? "I accept this declaration"
            : "I confirm my details are accurate"}
        </span>
      </label>

      {draft.ownershipDeclared && (
        <div className="flex items-center gap-sm rounded-xl border border-primary/30 bg-primary/5 px-md py-sm">
          <Icon name="check_circle" className="text-data-price" />
          <p className="text-sm text-on-surface">
            Thank you — you can now review and submit.
          </p>
        </div>
      )}
    </div>
  );
}