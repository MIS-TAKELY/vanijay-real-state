"use client";

import { Button, cn, Icon, Input, Label } from "@repo/ui";
import { ApiError } from "lib/api/core/client";
import { deleteUpload, uploadFile, uploadFiles } from "lib/api/services/uploads";
import { useRef, useState } from "react";
import type { DraftMedia } from "./draft";
import type { StepProps } from "./types";

const DROP =
  "flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer";

const MAX_PHOTOS = 20;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

interface PendingUpload {
  key: string;
  objectUrl: string;
  name: string;
}

/**
 * Media & Documents step.
 *
 * Photos are genuinely uploaded to Cloudinary the moment the user picks them
 * (POST /api/v1/uploads) and the returned secure URLs are stored on the draft,
 * so they are included with the listing on submit. A video-walkthrough URL is
 * captured too. Cadastral map / ownership documents remain lightweight helpers
 * (uploaded here for review) — the verification team finalizes those records.
 */
export function StepMediaDocs({ draft, update }: StepProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cadastralInputRef = useRef<HTMLInputElement>(null);

  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cadastral, setCadastral] = useState<DraftMedia | null>(null);
  const [cadastralUploading, setCadastralUploading] = useState(false);

  const photos = draft.media;

  const handlePhotoFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length - pending.length;
    const accepted = Array.from(files)
      .filter((f) => ACCEPTED_IMAGE_TYPES.includes(f.type))
      .slice(0, remaining);
    if (accepted.length === 0) {
      setUploadError(
        remaining <= 0
          ? `You can add up to ${MAX_PHOTOS} photos.`
          : "Only JPEG, PNG, WEBP, GIF or AVIF images are supported.",
      );
      return;
    }

    setUploadError(null);
    const items: PendingUpload[] = accepted.map((file) => ({
      key: `${file.name}-${Date.now()}-${Math.random()}`,
      objectUrl: URL.createObjectURL(file),
      name: file.name,
    }));
    setPending((prev) => [...prev, ...items]);

    try {
      const assets = await uploadFiles(accepted, "properties");
      const uploaded: DraftMedia[] = assets.map((asset) => ({
        url: asset.secureUrl || asset.url,
        publicId: asset.publicId,
        type: "IMAGE",
        altText: asset.originalFilename,
      }));
      update({ media: [...photos, ...uploaded] });
    } catch (error) {
      setUploadError(
        error instanceof ApiError
          ? error.message
          : "Couldn't upload your photos. Check the connection and try again.",
      );
    } finally {
      setPending((prev) => prev.filter((item) => !items.includes(item)));
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    const removed = photos[index];
    update({ media: photos.filter((_, i) => i !== index) });
    if (removed?.publicId) {
      deleteUpload(removed.publicId).catch(() => {/* orphan is harmless */});
    }
  };

  const handleCadastralFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setCadastralUploading(true);
    setUploadError(null);
    try {
      const asset = await uploadFile(file, "documents");
      setCadastral({
        url: asset.secureUrl || asset.url,
        publicId: asset.publicId,
        type: "CADASTRAL_MAP",
        altText: file.name,
      });
    } catch (error) {
      setUploadError(
        error instanceof ApiError
          ? error.message
          : "Couldn't upload the cadastral map.",
      );
    } finally {
      setCadastralUploading(false);
      if (cadastralInputRef.current) cadastralInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-md">
      {/* ====================== Photo uploader ====================== */}
      <div className="flex flex-col gap-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-[13px] font-semibold text-on-surface">
            Photos{" "}
            <span className="font-normal text-on-surface-variant">
              ({photos.length}/{MAX_PHOTOS})
            </span>
          </span>
          {photos.length > 0 ? (
            <span className="mono-stat text-[11px] text-on-surface-variant">
              First photo = cover
            </span>
          ) : null}
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handlePhotoFiles(e.target.files)}
        />

        <div className="grid grid-cols-2 gap-sm sm:grid-cols-4">
          {photos.map((photo, i) => (
            <div key={photo.publicId ?? `${photo.url}-${i}`} className="relative">
              <div className="relative h-28 w-full overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.altText ?? `Photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-surface/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-tertiary">
                    Cover
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove photo"
                  onClick={() => removePhoto(i)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-surface/95 text-error shadow-sm hover:bg-error hover:text-white cursor-pointer"
                >
                  <Icon name="close" className="text-[14px]" />
                </Button>
              </div>
            </div>
          ))}

          {pending.map((p) => (
            <div
              key={p.key}
              className="relative h-28 w-full overflow-hidden rounded-xl bg-surface-container"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.objectUrl}
                alt={p.name}
                className="h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-surface/40">
                <Icon
                  name="progress_activity"
                  className="animate-spin text-[22px] text-primary"
                />
                <span className="text-[10px] text-on-surface-variant">Uploading…</span>
              </div>
            </div>
          ))}

          {photos.length + pending.length < MAX_PHOTOS && (
            <Button
              type="button"
              variant="outline"
              className={cn(DROP, "h-28 border-outline-variant")}
              onClick={() => photoInputRef.current?.click()}
            >
              <span className="flex flex-col items-center gap-xs">
                <Icon name="add" className="text-[28px]" />
                <span className="text-[12px]">Add photo</span>
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* ==================== Video walkthrough URL ==================== */}
      <div className="flex flex-col gap-xs">
        <Label htmlFor="w-video">
          Video walkthrough URL{" "}
          <span className="font-normal text-on-surface-variant">(optional)</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <Icon name="videocam" className="text-[18px]" />
          </span>
          <Input
            id="w-video"
            type="url"
            value={draft.videoUrl}
            onChange={(e) => update({ videoUrl: e.target.value })}
            placeholder="https://youtube.com/…"
            className="h-11 pl-10 pr-3"
          />
        </div>
      </div>

      {/* ================= Cadastral map + document attach ================= */}
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <input
          ref={cadastralInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleCadastralFile(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => cadastralInputRef.current?.click()}
          className={cn(DROP, "h-auto flex-col gap-1 py-md border-outline-variant")}
        >
          <Icon name="map" className="text-[28px]" />
          <span className="text-[13px] font-medium">Cadastral map (Naksa)</span>
          <span className="text-[11px] text-on-surface-variant">PDF / image, max 10MB</span>
          {cadastralUploading ? (
            <span className="flex items-center gap-1 text-[12px] text-primary">
              <Icon name="progress_activity" className="animate-spin text-[14px]" />
              Uploading…
            </span>
          ) : cadastral ? (
            <span className="text-[12px] text-primary">Uploaded ✓ {cadastral.altText}</span>
          ) : null}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={cn(DROP, "h-auto flex-col gap-1 py-md border-outline-variant")}
        >
          <Icon name="verified" className="text-[28px]" />
          <span className="text-[13px] font-medium">Attach document</span>
          <span className="text-[11px] text-on-surface-variant">
            Lalpurja, tax clearance… (reviewed during verification)
          </span>
        </Button>
      </div>

      {uploadError && (
        <p role="alert" className="text-[12px] text-error">
          {uploadError}
        </p>
      )}
    </div>
  );
}
