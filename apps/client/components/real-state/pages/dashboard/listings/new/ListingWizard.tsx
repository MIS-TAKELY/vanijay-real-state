"use client";

import { Button } from "@repo/ui";
import {
  ListingWizard as SharedListingWizard,
  listingDraftFromApiProperty,
  type ListingDraft,
} from "@repo/ui";
import { useEffect, useState } from "react";
import {
  createProperty,
  fetchMyListingsGraphql,
  updateProperty,
} from "lib/api/services/properties";
import {
  deleteUpload,
  uploadFile,
  uploadFiles,
  type UploadFolder,
} from "lib/api/services/uploads";

/**
 * Seller-facing wrapper around the shared @repo/ui listing wizard.
 * Owns the client-specific data access: loading an existing listing by slug
 * (edit mode), and persisting through the client REST API.
 */
export function ListingWizard({ editSlug }: { editSlug?: string }) {
  // Edit mode: pre-load the property into the draft before showing the form.
  const [loading, setLoading] = useState(Boolean(editSlug));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [draft, setDraft] = useState<ListingDraft | null>(null);
  // The DB id resolved from the slug — required for the PATCH on save.
  const [editPropertyId, setEditPropertyId] = useState<string | null>(null);

  useEffect(() => {
    if (!editSlug) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void fetchMyListingsGraphql()
      .then((properties) => {
        if (cancelled) return;
        const found = properties.find((p) => p.slug === editSlug);
        if (!found) {
          setLoadError("Listing not found or you don't have access to it.");
          setLoading(false);
          return;
        }
        setEditPropertyId(found.id);
        setDraft(listingDraftFromApiProperty(found));
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(
          e instanceof Error ? e.message : "Failed to load listing.",
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editSlug, reloadKey]);

  if (loading) {
    return (
      <div className="flex flex-col gap-md">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl border border-outline-variant bg-surface"
          />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-md rounded-2xl border border-outline-variant bg-surface p-xl text-center">
        <p className="max-w-(--container-md) text-sm text-on-surface-variant">
          {loadError}
        </p>
        <Button
          variant="outline"
          onClick={() => setReloadKey((k) => k + 1)}
          className="rounded-md border-outline-variant px-md py-2 text-sm font-semibold text-on-surface hover:border-primary hover:text-primary"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <SharedListingWizard
      key={reloadKey}
      initialDraft={draft}
      uploads={{
        uploadFile: (file, folder) => uploadFile(file, folder as UploadFolder),
        uploadFiles: (files, folder) =>
          uploadFiles(files, folder as UploadFolder),
        deleteUpload,
      }}
      onSubmit={async (payload) => {
        const property = editPropertyId
          ? await updateProperty(editPropertyId, payload)
          : await createProperty(payload);
        return {
          id: property.id,
          slug: property.slug,
          title: property.title,
          listingCode: property.listingCode,
        };
      }}
      successMode={editPropertyId ? "edit" : "create"}
      successHref="/my-listings"
      successHrefLabel="My Listings"
    />
  );
}
