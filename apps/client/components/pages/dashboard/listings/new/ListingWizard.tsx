"use client";

import { Button, Icon } from "@repo/ui";
import { useState } from "react";
import { WIZARD_STEPS } from "./constants";
import { StepBasics } from "./StepBasics";
import { StepLandSpecs } from "./StepLandSpecs";
import { StepLocation } from "./StepLocation";
import { StepMediaDocs } from "./StepMediaDocs";
import { StepReview } from "./StepReview";
import { WizardProgress } from "./WizardProgress";

export function ListingWizard() {
  const [step, setStep] = useState(0);
  const isLast = step === WIZARD_STEPS.length - 1;

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepBasics />;
      case 1:
        return <StepLocation />;
      case 2:
        return <StepLandSpecs />;
      case 3:
        return <StepMediaDocs />;
      default:
        return <StepReview />;
    }
  };

  const submit = () => {
    alert("Submitted for verification (placeholder). Status → UNDER_VERIFICATION");
  };

  return (
    <div className="flex flex-col rounded-2xl border border-outline-variant bg-surface p-md">
      <WizardProgress currentStep={step} />

      <div className="border-t border-outline-variant pt-md">{renderStep()}</div>

      {/* Footer nav */}
      <div className="mt-md flex items-center justify-between border-t border-outline-variant pt-md">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          <Icon name="chevron_left" className="text-data-table" />
          Back
        </Button>

        {isLast ? (
          <div className="flex items-center gap-xs">
            <Button type="button" variant="outline">
              <Icon name="archive" className="text-data-table" />
              Save Draft
            </Button>
            <Button type="button" onClick={submit}>
              <Icon name="check_circle" className="text-data-table" />
              Submit for Verification
            </Button>
          </div>
        ) : (
          <Button type="button" onClick={() => setStep((s) => s + 1)}>
            Continue
            <Icon name="arrow_forward" className="text-data-table" />
          </Button>
        )}
      </div>
    </div>
  );
}
