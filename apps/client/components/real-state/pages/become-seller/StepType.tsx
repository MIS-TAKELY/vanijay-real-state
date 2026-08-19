"use client";

import { Icon, cn } from "@repo/ui";
import { ACCOUNT_TYPES } from "./constants";
import type { WizardDraft } from "./SellerWizard";

interface StepTypeProps {
  draft: WizardDraft;
  onPatch: (patch: Partial<WizardDraft>) => void;
}

/**
 * Step 1 — pick the account type, then the sub type. Two calm choices,
 * nothing else on screen.
 */
export function StepType({ draft, onPatch }: StepTypeProps) {
  const selectedType = ACCOUNT_TYPES.find((t) => t.value === draft.accountType);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <h3 className="text-lg font-semibold text-on-surface">
          What kind of seller account do you need?
        </h3>
        <p className="text-sm text-on-surface-variant">
          This decides which details we&apos;ll ask for. You can&apos;t change
          it after submitting.
        </p>
      </div>

      {/* Account type cards */}
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
        {ACCOUNT_TYPES.map((type) => {
          const active = draft.accountType === type.value;
          const firstSubType = type.subTypes[0];
          return (
            <button
              key={type.value}
              type="button"
              onClick={() =>
                onPatch({
                  accountType: type.value,
                  ...(firstSubType ? { subType: firstSubType.value } : {}),
                })
              }
              className={cn(
                "flex flex-col items-start gap-xs rounded-xl border p-md text-left transition-colors",
                active
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface hover:border-primary/50",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  active
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant",
                )}
              >
                <Icon name={type.icon} className="text-data-table" />
              </span>
              <span className="text-sm font-semibold text-on-surface">
                {type.label}
              </span>
              <span className="text-xs leading-5 text-on-surface-variant">
                {type.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub type — only once a type is chosen */}
      {selectedType && (
        <div className="flex flex-col gap-sm">
          <p className="text-sm font-medium text-on-surface">
            Which best describes you?
          </p>
          <div className="flex flex-wrap gap-sm">
            {selectedType.subTypes.map((sub) => {
              const active = draft.subType === sub.value;
              return (
                <button
                  key={sub.value}
                  type="button"
                  onClick={() => onPatch({ subType: sub.value })}
                  className={cn(
                    "flex flex-col items-start gap-0.5 rounded-lg border px-md py-sm text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant bg-surface hover:border-primary/50",
                  )}
                >
                  <span className="text-sm font-semibold text-on-surface">
                    {sub.label}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {sub.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}