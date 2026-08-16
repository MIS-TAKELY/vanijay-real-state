"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
import {
  clearWizardDraft,
  loadWizardDraft,
  saveWizardDraft,
} from "./draft-storage";
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
  const [draft, setDraft] = useState<ListingDraft>(
    initialDraft ?? INITIAL_DRAFT,
  );
  const [errors, setErrors] = useState<DraftErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<SavedListing | null>(null);
  // True when a previously saved draft was restored from localStorage — shows
  // the "resumed draft" banner with a "Start fresh" escape hatch.
  const [restored, setRestored] = useState(false);

  // Create mode only: edit mode is API-backed, so local drafts are ignored.
  const isEditMode = Boolean(initialDraft);

  // Latest draft/step for the unload flush (the debounced effect below would
  // lose the final keystrokes if the tab closes before its timer fires).
  const latest = useRef({ draft, step });
  useEffect(() => {
    latest.current = { draft, step };
  }, [draft, step]);

  // Restore a saved draft once on mount (create mode). Runs after hydration,
  // so the first paint matches the server render — no hydration mismatch.
  useEffect(() => {
    if (isEditMode) return;
    const saved = loadWizardDraft();
    if (saved) {
      setDraft(saved.draft);
      setStep(saved.step);
      setRestored(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save on every draft/step change (a blur is always preceded by a
  // change, so this covers the spec's "persist on field blur" reliably).
  useEffect(() => {
    if (isEditMode || created) return;
    const timer = setTimeout(() => saveWizardDraft(draft, step), 400);
    return () => clearTimeout(timer);
  }, [draft, step, isEditMode, created]);

  // Flush immediately when the tab is hidden or unloaded.
  useEffect(() => {
    if (isEditMode) return;
    const flush = () =>
      saveWizardDraft(latest.current.draft, latest.current.step);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isEditMode]);

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
      // Published — the draft is no longer in progress.
      clearWizardDraft();
      setRestored(false);
    } catch (error) {
      setServerError(submitErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const startFresh = () => {
    clearWizardDraft();
    setDraft(INITIAL_DRAFT);
    setStep(0);
    setErrors({});
    setServerError(null);
    setRestored(false);
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
                clearWizardDraft();
                setDraft(INITIAL_DRAFT);
                setStep(0);
                setCreated(null);
                setErrors({});
                setServerError(null);
                setRestored(false);
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
      {restored && !created && (
        <div className="mb-md flex items-center justify-between gap-sm rounded-lg border border-primary/30 bg-primary/5 px-sm py-2 text-sm text-on-surface">
          <span className="flex items-center gap-1.5">
            <Icon name="history" className="text-[16px]" />
            Resumed your saved draft
          </span>
          <button
            type="button"
            onClick={startFresh}
            className="shrink-0 rounded-md px-2 py-1 text-[13px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            Start fresh
          </button>
        </div>
      )}
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
