"use client";

import { Alert, AlertDescription, Button, Icon } from "@repo/ui";
import { ApiError } from "lib/api/core/client";
import { createProperty } from "lib/api/services/properties";
import type { ApiProperty } from "lib/api/services/properties/types";
import Link from "next/link";
import { useState } from "react";
import { WIZARD_STEPS } from "./constants";
import {
  buildCreatePayload,
  INITIAL_DRAFT,
  validateAll,
  validateStep,
  type DraftErrors,
  type ListingDraft,
} from "./draft";
import { StepBasics } from "./StepBasics";
import { StepLandSpecs } from "./StepLandSpecs";
import { StepLocation } from "./StepLocation";
import { StepMediaDocs } from "./StepMediaDocs";
import { StepReview } from "./StepReview";
import { WizardProgress } from "./WizardProgress";

export function ListingWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ListingDraft>(INITIAL_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<ApiProperty | null>(null);

  const isLast = step === WIZARD_STEPS.length - 1;

  const update = (patch: Partial<ListingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) {
        delete next[key];
      }
      return next;
    });
  };

  const goNext = () => {
    const stepErrors = validateStep(step, draft);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const submit = async () => {
    const { errors: allErrors, firstInvalidStep } = validateAll(draft);
    if (firstInvalidStep !== null) {
      setErrors(allErrors);
      setStep(firstInvalidStep);
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const property = await createProperty(buildCreatePayload(draft));
      setCreated(property);
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(
          error.status === 403
            ? "Your account doesn't have seller access yet — register as a seller from your profile first."
            : error.status === 400
              ? `The listing data is incomplete or invalid: ${error.message}`
              : error.message,
        );
      } else {
        setServerError(
          "Couldn't reach the server. Check that the API is running and try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="flex flex-col items-center gap-md rounded-2xl border border-outline-variant bg-surface p-xl text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary">
          <Icon name="check_circle" className="text-[32px]" />
        </span>
        <h2 className="font-headline-md text-xl font-semibold text-on-surface">
          {created.title}
        </h2>
        <p className="text-sm leading-6 text-on-surface-variant">
          Listing{" "}
          <span className="mono-stat font-semibold">{created.listingCode}</span>{" "}
          was saved as a draft and queued for verification. It goes live on the
          public feed once the document check passes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-sm">
          <Button asChild className="rounded-md">
            <Link href="/my-listings">
              <Icon name="list_alt" className="text-data-table" />
              My Listings
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-md"
            onClick={() => {
              setDraft(INITIAL_DRAFT);
              setStep(0);
              setCreated(null);
              setErrors({});
              setServerError(null);
            }}
          >
            <Icon name="add" className="text-data-table" />
            Create another
          </Button>
        </div>
      </div>
    );
  }

  const stepProps = { draft, update, errors };
  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepBasics {...stepProps} />;
      case 1:
        return <StepLocation {...stepProps} />;
      case 2:
        return <StepLandSpecs {...stepProps} />;
      case 3:
        return <StepMediaDocs {...stepProps} />;
      default:
        return <StepReview {...stepProps} />;
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-outline-variant bg-surface p-md">
      <WizardProgress currentStep={step} />

      <div className="border-t border-outline-variant pt-md">
        {renderStep()}
      </div>

      {serverError && (
        <Alert variant="destructive" className="mt-md">
          <Icon name="error" className="text-[18px]" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Footer nav */}
      <div className="mt-md flex items-center justify-between border-t border-outline-variant pt-md">
        <Button
          variant="outline"
          disabled={step === 0 || submitting}
          onClick={() => {
            setErrors({});
            setStep((s) => s - 1);
          }}
        >
          <Icon name="chevron_left" className="text-data-table" />
          Back
        </Button>

        {isLast ? (
          <Button type="button" onClick={submit} disabled={submitting}>
            {submitting ? (
              <>
                <Icon
                  name="progress_activity"
                  className="text-data-table animate-spin"
                />
                Saving…
              </>
            ) : (
              <>
                <Icon name="check_circle" className="text-data-table" />
                Submit for Verification
              </>
            )}
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            Continue
            <Icon name="arrow_forward" className="text-data-table" />
          </Button>
        )}
      </div>
    </div>
  );
}
