"use client";

import { Button, Icon, Progress } from "@repo/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchSellerProfile,
  saveSellerProfile,
  submitSellerProfile,
  type SaveSellerProfileInput,
  type SellerProfileView,
} from "lib/api/services/seller";
import { WIZARD_STEPS } from "./constants";
import { StepType } from "./StepType";
import { StepVerify } from "./StepVerify";
import { StepDetails } from "./StepDetails";
import { StepDeclaration } from "./StepDeclaration";
import { StepReview } from "./StepReview";
import { SellerSubmitted } from "./SellerSubmitted";

/** Local, editable copy of the wizard fields. */
export interface WizardDraft {
  accountType: SellerProfileView["accountType"];
  subType: SellerProfileView["subType"];
  fullName: string;
  ownershipDeclared: boolean;
  businessName: string;
  representativeName: string;
  hasBusinessRegistration: boolean;
  registrationNumber: string;
  businessEmail: string;
  businessPhone: string;
  website: string;
  officeDistrict: string;
  officeAddress: string;
}

function draftFromProfile(p: SellerProfileView): WizardDraft {
  return {
    accountType: p.accountType,
    subType: p.subType,
    fullName: p.fullName,
    ownershipDeclared: p.ownershipDeclared,
    businessName: p.businessName,
    representativeName: p.representativeName,
    hasBusinessRegistration: p.hasBusinessRegistration,
    registrationNumber: p.registrationNumber,
    businessEmail: p.businessEmail,
    businessPhone: p.businessPhone,
    website: p.website,
    officeDistrict: p.officeDistrict,
    officeAddress: p.officeAddress,
  };
}

export function SellerWizard() {
  const [profile, setProfile] = useState<SellerProfileView | null>(null);
  const [draft, setDraft] = useState<WizardDraft | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SellerProfileView | null>(null);

  // Load existing profile for save-and-resume.
  useEffect(() => {
    let cancelled = false;
    fetchSellerProfile()
      .then((p) => {
        if (cancelled) return;
        setProfile(p);
        setDraft(draftFromProfile(p));
        // If already submitted/approved, jump straight to the status view.
        if (p.status === "SUBMITTED" || p.status === "APPROVED") {
          setSubmitted(p);
        }
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(
          e instanceof Error ? e.message : "Failed to load your details.",
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const step = WIZARD_STEPS[stepIndex] ?? WIZARD_STEPS[0];
  const progress = useMemo(
    () => Math.round(((stepIndex + 1) / WIZARD_STEPS.length) * 100),
    [stepIndex],
  );

  const patchDraft = useCallback((patch: Partial<WizardDraft>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }, []);

  /** Persist the current draft server-side (save and resume). */
  const persistDraft =
    useCallback(async (): Promise<SellerProfileView | null> => {
      if (!draft || !draft.accountType || !draft.subType) return profile;
      setSaving(true);
      try {
        const input: SaveSellerProfileInput = {
          accountType: draft.accountType,
          subType: draft.subType,
          fullName: draft.fullName || undefined,
          ownershipDeclared: draft.ownershipDeclared,
          businessName: draft.businessName || undefined,
          representativeName: draft.representativeName || undefined,
          hasBusinessRegistration: draft.hasBusinessRegistration,
          registrationNumber: draft.registrationNumber || undefined,
          businessEmail: draft.businessEmail || undefined,
          businessPhone: draft.businessPhone || undefined,
          website: draft.website || undefined,
          officeDistrict: draft.officeDistrict || undefined,
          officeAddress: draft.officeAddress || undefined,
        };
        const saved = await saveSellerProfile(input);
        setProfile(saved);
        return saved;
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Couldn't save your progress.",
        );
        return null;
      } finally {
        setSaving(false);
      }
    }, [draft, profile]);

  const goNext = useCallback(async () => {
    setError(null);
    // Persist on advance so progress is never lost.
    await persistDraft();
    setStepIndex((i) => Math.min(i + 1, WIZARD_STEPS.length - 1));
  }, [persistDraft]);

  const goBack = useCallback(() => {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setSubmitting(true);
    try {
      // Make sure the latest draft is saved, then submit.
      const saved = await persistDraft();
      if (!saved) return; // Save failed — error already surfaced.
      const result = await submitSellerProfile();
      setSubmitted(result);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Submission failed. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [persistDraft]);

  if (loading) {
    return (
      <div className="flex flex-col gap-md">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl border border-outline-variant bg-surface"
          />
        ))}
      </div>
    );
  }

  if (submitted) {
    return <SellerSubmitted profile={submitted} />;
  }

  if (!draft || !profile) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error ?? "Something went wrong. Please refresh and try again."}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-lg">
      {/* Progress */}
      <div className="flex flex-col gap-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-on-surface">
            Step {stepIndex + 1} of {WIZARD_STEPS.length}
          </p>
          <p className="text-sm text-on-surface-variant">{step.label}</p>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Step body */}
      <div className="rounded-2xl border border-outline-variant bg-surface p-md sm:p-lg">
        {step.id === "type" && <StepType draft={draft} onPatch={patchDraft} />}
        {step.id === "verify" && (
          <StepVerify
            requirements={profile.requirements}
            onRequirementsChange={(requirements) =>
              setProfile((p) => (p ? { ...p, requirements } : p))
            }
          />
        )}
        {step.id === "details" && (
          <StepDetails draft={draft} onPatch={patchDraft} />
        )}
        {step.id === "declaration" && (
          <StepDeclaration draft={draft} onPatch={patchDraft} />
        )}
        {step.id === "review" && (
          <StepReview draft={draft} requirements={profile.requirements} />
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-sm">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={stepIndex === 0 || saving || submitting}
          className="rounded-md"
        >
          <Icon name="chevron_left" className="text-data-table" />
          Back
        </Button>

        {step.id === "review" ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || saving}
            className="rounded-md bg-gold text-on-gold hover:bg-gold/90"
          >
            {submitting ? (
              <Icon
                name="progress_activity"
                className="animate-spin text-data-table"
              />
            ) : (
              <Icon name="check" className="text-data-table" />
            )}
            {submitting ? "Submitting…" : "Submit for review"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={goNext}
            disabled={saving || submitting}
            className="rounded-md"
          >
            {saving ? (
              <Icon
                name="progress_activity"
                className="animate-spin text-data-table"
              />
            ) : null}
            {saving ? "Saving…" : "Continue"}
            <Icon name="arrow_forward" className="text-data-table" />
          </Button>
        )}
      </div>
    </div>
  );
}
