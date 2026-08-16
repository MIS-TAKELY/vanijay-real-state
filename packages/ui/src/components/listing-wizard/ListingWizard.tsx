"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { WIZARD_STEPS } from "./constants";
import {
  buildCreatePayload,
  INITIAL_DRAFT,
  validateAll,
  validateStep,
  type CreatePropertyPayload,
  type DraftErrors,
  type ListingDraft,
} from "./draft";
import { StepBasics } from "./StepBasics";
import { StepLandSpecs } from "./StepLandSpecs";
import { StepLocation } from "./StepLocation";
import { StepMediaDocs } from "./StepMediaDocs";
import { StepReview } from "./StepReview";
import { WizardProgress } from "./WizardProgress";
import type { WizardUploads } from "./types";

/** Minimal shape of the saved property — enough for the success screen. */
export interface SavedListing {
  id: string;
  slug: string;
  title: string;
  listingCode: string;
}

export interface ListingWizardProps {
  /** Pre-filled draft (edit mode). The host app loads the property first. */
  initialDraft?: ListingDraft | null;
  /** Persist the draft (create or update). Must resolve to the saved property. */
  onSubmit: (payload: CreatePropertyPayload) => Promise<SavedListing>;
  /** File-upload infrastructure — photos/videos/documents hit Cloudinary. */
  uploads: WizardUploads;
  /** Label for the final submit button. Defaults to "Publish Listing". */
  submitLabel?: string;
  /** Copy for the success screen. Defaults to "create". */
  successMode?: "create" | "edit";
  /** CTA link on the success screen. Defaults to "/my-listings". */
  successHref?: string;
  successHrefLabel?: string;
  /** Hide the map picker + location search (e.g. admin console, no map key). */
  showMap?: boolean;
  /** Extra block rendered above the footer nav (e.g. admin moderation fields). */
  footerExtra?: ReactNode;
}

function submitErrorMessage(e: unknown): string {
  if (e && typeof e === "object" && "status" in e) {
    const status = (e as { status?: unknown }).status;
    const message = (e as { message?: unknown }).message;
    const msg = typeof message === "string" ? message : "";
    if (status === 403)
      return "Your account doesn't have seller access yet — register as a seller from your profile first.";
    if (status === 400)
      return `The listing data is incomplete or invalid: ${msg}`;
    if (msg) return msg;
  }
  if (e instanceof Error && e.message) return e.message;
  return "Couldn't reach the server. Check that the API is running and try again.";
}

/**
 * Shared multi-step listing form (create + edit). Data access is injected:
 * the host app supplies `onSubmit` and `uploads`, so the same UI powers the
 * seller dashboard and the admin console.
 */
export function ListingWizard({
  initialDraft,
  onSubmit,
  uploads,
  submitLabel = "Publish Listing",
  successMode = "create",
  successHref = "/my-listings",
  successHrefLabel = "My Listings",
  showMap = true,
  footerExtra,
}: ListingWizardProps) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ListingDraft>(initialDraft ?? INITIAL_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<SavedListing | null>(null);

  // Edit mode: adopt the loaded draft when it arrives (or changes).
  useEffect(() => {
    if (!initialDraft) return;
    setDraft(initialDraft);
    setStep(0);
    setCreated(null);
    setErrors({});
    setServerError(null);
  }, [initialDraft]);

  const isLast = step === WIZARD_STEPS.length - 1;

  const update = useCallback((patch: Partial<ListingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) {
        delete next[key];
      }
      return next;
    });
  }, []);

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
      const payload = buildCreatePayload(draft);
      const saved = await onSubmit(payload);
      setCreated(saved);
    } catch (error) {
      setServerError(submitErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    const isNew = successMode === "create";
    return (
      <div className="flex flex-col items-center gap-md rounded-2xl border border-outline-variant bg-surface p-xl text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary">
          <Icon name="check_circle" className="text-data-price" />
        </span>
        <h2 className="font-headline-md text-xl font-semibold text-on-surface">
          {created.title}
        </h2>
        <p className="text-sm leading-6 text-on-surface-variant">
          {isNew ? (
            <>
              Listing{" "}
              <span className="mono-stat font-semibold">
                {created.listingCode}
              </span>{" "}
              is now live on the public feed, marked as{" "}
              <span className="font-semibold">UNVERIFIED</span>. Our
              verification team reviews the ownership documents — the
              verification status updates as it progresses.
            </>
          ) : (
            <>
              Changes to{" "}
              <span className="mono-stat font-semibold">
                {created.listingCode}
              </span>{" "}
              were saved. Refresh the list to confirm the updated details.
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-sm">
          <Button asChild className="rounded-md">
            <Link href={successHref}>
              <Icon name="list_alt" className="text-data-table" />
              {successHrefLabel}
            </Link>
          </Button>
          {isNew && (
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
          )}
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
        return <StepLocation {...stepProps} showMap={showMap} />;
      case 2:
        return <StepLandSpecs {...stepProps} />;
      case 3:
        return <StepMediaDocs {...stepProps} uploads={uploads} />;
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

      {footerExtra}

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
                {submitLabel}
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
