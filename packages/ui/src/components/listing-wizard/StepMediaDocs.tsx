"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRef, useState } from "react";
import { VideoPoster } from "./VideoPoster";
import type { DraftDocument, DraftMedia } from "./draft";
import { getErrorMessage, type StepProps, type WizardUploads } from "./types";

const DROP =
  "flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer";

function isImageUrl(url: string): boolean {
  if (!url) return false;
  const clean = (url.split("?")[0] ?? "").toLowerCase();
  return /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(clean);
}

const MAX_PHOTOS = 20;
const MAX_VIDEOS = 5;
const MAX_DOCUMENTS = 10;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ACCEPTED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const DOCUMENT_TYPE_OPTIONS = [
  { value: "LALPURJA", label: "Lalpurja (Land Ownership)" },
  { value: "TAX_CLEARANCE", label: "Tax Clearance" },
  { value: "SURVEY_NAKSA_MAP", label: "Survey / Naksa Map" },
  { value: "PAN_CARD", label: "PAN Card" },
  { value: "OTHER", label: "Other Document" },
] as const;

interface PendingUpload {
  key: string;
  objectUrl: string;
  name: string;
  kind: "photo" | "video" | "document";
}

interface StepMediaDocsProps extends StepProps {
  uploads: WizardUploads;
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
export function StepMediaDocs({ draft, update, uploads }: StepMediaDocsProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cadastralInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cadastralUploading, setCadastralUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [docUploading, setDocUploading] = useState(false);

  const photos = draft.media.filter(
    (m) => m.type !== "VIDEO_WALKTHROUGH" && m.type !== "CADASTRAL_MAP",
  );
  const uploadedVideos = draft.media.filter((m) => m.type === "VIDEO_WALKTHROUGH");
  // Naksa (cadastral map) lives in draft.media so it's saved with the listing.
  const cadastral = draft.media.find((m) => m.type === "CADASTRAL_MAP") ?? null;
  const mediaRef = useRef(draft.media);
  mediaRef.current = draft.media;

  const finishPending = (items: PendingUpload[]) => {
    setPending((prev) => prev.filter((item) => !items.includes(item)));
    requestAnimationFrame(() => {
      for (const item of items) URL.revokeObjectURL(item.objectUrl);
    });
  };

  const handlePhotoFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const pendingPhotos = pending.filter((p) => p.kind === "photo").length;
    const remaining = MAX_PHOTOS - photos.length - pendingPhotos;
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
      kind: "photo",
    }));
    setPending((prev) => [...prev, ...items]);

    try {
      const assets = await uploads.uploadFiles(accepted, "properties");
      const uploaded: DraftMedia[] = assets.map((asset) => ({
        url: asset.secureUrl || asset.url,
        publicId: asset.publicId,
        type: "IMAGE",
        altText: asset.originalFilename,
      }));
      update({ media: [...mediaRef.current, ...uploaded] });
    } catch (error) {
      setUploadError(getErrorMessage(error));
    } finally {
      finishPending(items);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleVideoFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const pendingVideos = pending.filter((p) => p.kind === "video").length;
    const remaining = MAX_VIDEOS - uploadedVideos.length - pendingVideos;
    const ofType = Array.from(files).filter((f) =>
      ACCEPTED_VIDEO_TYPES.includes(f.type),
    );
    if (ofType.length === 0) {
      setUploadError(
        remaining <= 0
          ? `You can add up to ${MAX_VIDEOS} videos.`
          : "Only MP4, WebM or QuickTime videos are supported.",
      );
      return;
    }
    const oversized = ofType.find((f) => f.size > MAX_VIDEO_BYTES);
    if (oversized) {
      setUploadError("Videos must be 50 MB or smaller.");
      return;
    }
    const accepted = ofType.slice(0, remaining);
    if (accepted.length === 0) {
      setUploadError(`You can add up to ${MAX_VIDEOS} videos.`);
      return;
    }

    setUploadError(null);
    const items: PendingUpload[] = accepted.map((file) => ({
      key: `${file.name}-${Date.now()}-${Math.random()}`,
      objectUrl: URL.createObjectURL(file),
      name: file.name,
      kind: "video",
    }));
    setPending((prev) => [...prev, ...items]);

    try {
      // Upload videos one at a time — they're larger and Cloudinary may
      // reject concurrent large uploads.
      const uploaded: DraftMedia[] = [];
      for (const file of accepted) {
        const asset = await uploads.uploadFile(file, "properties");
        uploaded.push({
          url: asset.secureUrl || asset.url,
          publicId: asset.publicId,
          type: "VIDEO_WALKTHROUGH",
          altText: asset.originalFilename,
        });
      }
      update({ media: [...mediaRef.current, ...uploaded] });
    } catch (error) {
      setUploadError(getErrorMessage(error));
    } finally {
      finishPending(items);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const removeMediaItem = (item: DraftMedia) => {
    update({ media: draft.media.filter((m) => m !== item) });
    if (item.publicId) {
      uploads.deleteUpload(item.publicId).catch(() => {/* orphan is harmless */});
    }
  };

  const handleDocumentFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !selectedDocType) return;

    if (draft.documents.length >= MAX_DOCUMENTS) {
      setUploadError(`You can add up to ${MAX_DOCUMENTS} documents.`);
      return;
    }

    setDocUploading(true);
    setUploadError(null);
    try {
      const asset = await uploads.uploadFile(file, "documents");
      const sizeMb = Number((file.size / (1024 * 1024)).toFixed(2));
      const doc: DraftDocument = {
        type: selectedDocType,
        fileUrl: asset.secureUrl || asset.url,
        publicId: asset.publicId,
        fileName: file.name,
        fileSizeMb: sizeMb,
      };
      update({ documents: [...draft.documents, doc] });
      setSelectedDocType("");
    } catch (error) {
      setUploadError(getErrorMessage(error));
    } finally {
      setDocUploading(false);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const removeDocument = (doc: DraftDocument) => {
    update({ documents: draft.documents.filter((d) => d !== doc) });
    if (doc.publicId) {
      uploads.deleteUpload(doc.publicId).catch(() => {/* orphan is harmless */});
    }
  };

  const handleCadastralFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setCadastralUploading(true);
    setUploadError(null);
    try {
      const asset = await uploads.uploadFile(file, "documents");
      const item: DraftMedia = {
        url: asset.secureUrl || asset.url,
        publicId: asset.publicId,
        type: "CADASTRAL_MAP",
        altText: file.name,
      };
      // Keep a single naksa per listing — replace any previously attached one
      // and clean up its Cloudinary asset.
      const previous = mediaRef.current.find((m) => m.type === "CADASTRAL_MAP");
      update({
        media: [
          ...mediaRef.current.filter((m) => m.type !== "CADASTRAL_MAP"),
          item,
        ],
      });
      if (previous?.publicId) {
        uploads.deleteUpload(previous.publicId).catch(() => {/* orphan is harmless */});
      }
    } catch (error) {
      setUploadError(getErrorMessage(error));
    } finally {
      setCadastralUploading(false);
      if (cadastralInputRef.current) cadastralInputRef.current.value = "";
    }
  };

  const removeCadastral = () => {
    const item = cadastral;
    update({ media: draft.media.filter((m) => m.type !== "CADASTRAL_MAP") });
    if (item?.publicId) {
      uploads.deleteUpload(item.publicId).catch(() => {/* orphan is harmless */});
    }
  };

  return (
    <div className="flex flex-col gap-md">
      {/* ====================== Photo & Video uploader ====================== */}
      <div className="flex flex-col gap-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-[13px] font-semibold text-on-surface">
            Photos & Videos{" "}
            <span className="font-normal text-on-surface-variant">
              ({photos.length}/{MAX_PHOTOS} photos, {uploadedVideos.length}/{MAX_VIDEOS} videos)
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
        <input
          ref={videoInputRef}
          type="file"
          accept={ACCEPTED_VIDEO_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleVideoFiles(e.target.files)}
        />

        <div className="grid grid-cols-2 gap-sm sm:grid-cols-4">
          {/* Uploaded photos */}
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
                  onClick={() => removeMediaItem(photo)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-surface/95 text-error shadow-sm hover:bg-error hover:text-white cursor-pointer"
                >
                  <Icon name="close" className="text-[14px]" />
                </Button>
              </div>
            </div>
          ))}

          {/* Uploaded videos */}
          {uploadedVideos.map((video, i) => (
            <div key={video.publicId ?? `${video.url}-v-${i}`} className="relative">
              <div className="relative h-28 w-full overflow-hidden rounded-xl bg-surface-container">
                <VideoPoster url={video.url} alt={video.altText ?? "Video"} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <Icon name="play_circle" className="text-[28px] text-white drop-shadow-md" />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove video"
                  onClick={() => removeMediaItem(video)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-surface/95 text-error shadow-sm hover:bg-error hover:text-white cursor-pointer"
                >
                  <Icon name="close" className="text-[14px]" />
                </Button>
              </div>
            </div>
          ))}

          {/* Pending uploads (photos and videos) */}
          {pending.map((p) => (
            <div
              key={p.key}
              className="relative h-28 w-full overflow-hidden rounded-xl bg-surface-container"
            >
              {p.kind === "photo" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.objectUrl}
                  alt={p.name}
                  className="h-full w-full object-cover opacity-60"
                />
              ) : (
                <VideoPoster url={p.objectUrl} alt={p.name} className="opacity-60" />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-surface/40">
                <Icon
                  name="progress_activity"
                  className="animate-spin text-[22px] text-primary"
                />
                <span className="text-[10px] text-on-surface-variant">Uploading…</span>
              </div>
            </div>
          ))}

          {/* Add photo button */}
          {photos.length + pending.filter((p) => p.kind === "photo").length < MAX_PHOTOS && (
            <Button
              type="button"
              variant="outline"
              className={cn(DROP, "h-28 border-outline-variant")}
              onClick={() => photoInputRef.current?.click()}
            >
              <span className="flex flex-col items-center gap-xs">
                <Icon name="add_photo_alternate" className="text-[28px]" />
                <span className="text-[12px]">Add photo</span>
              </span>
            </Button>
          )}

          {/* Add video button */}
          {uploadedVideos.length + pending.filter((p) => p.kind === "video").length < MAX_VIDEOS && (
            <Button
              type="button"
              variant="outline"
              className={cn(DROP, "h-28 border-outline-variant")}
              onClick={() => videoInputRef.current?.click()}
            >
              <span className="flex flex-col items-center gap-xs">
                <Icon name="videocam" className="text-[28px]" />
                <span className="text-[12px]">Add video</span>
                <span className="text-[10px] text-on-surface-variant">MP4 / WebM, max 50 MB</span>
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* ==================== Video walkthrough URLs ==================== */}
      <div className="flex flex-col gap-xs">
        <div className="flex items-center justify-between">
          <Label>
            Video walkthroughs{" "}
            <span className="font-normal text-on-surface-variant">(optional)</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs font-medium text-primary hover:text-primary"
            onClick={() => update({ videoUrls: [...draft.videoUrls, ""] })}
          >
            <Icon name="add" className="text-[14px]" />
            Add video
          </Button>
        </div>

        {draft.videoUrls.length === 0 && (
          <p className="text-[12px] text-on-surface-variant">
            No videos added. Add YouTube, Vimeo, TikTok, Instagram, or X (Twitter) links.
            Social media links (TikTok, Instagram, X) open in a new tab.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {draft.videoUrls.map((url, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <Icon name="videocam" className="text-[18px]" />
                </span>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const next = [...draft.videoUrls];
                    next[idx] = e.target.value;
                    update({ videoUrls: next });
                  }}
                  placeholder="https://youtube.com/… or tiktok.com/…"
                  className="h-11 pl-10 pr-3"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove video"
                onClick={() => {
                  const next = draft.videoUrls.filter((_, i) => i !== idx);
                  update({ videoUrls: next });
                }}
                className="h-9 w-9 shrink-0 text-on-surface-variant hover:text-error"
              >
                <Icon name="close" className="text-[16px]" />
              </Button>
            </div>
          ))}
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
        {cadastral ? (
          <div className="flex flex-col gap-2 overflow-hidden rounded-xl border border-primary/40 bg-primary/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-on-surface">
                <Icon name="map" className="text-[18px] text-primary" />
                Naksa attached
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove naksa"
                onClick={removeCadastral}
                className="h-7 w-7 shrink-0 text-on-surface-variant hover:text-error"
              >
                <Icon name="close" className="text-[14px]" />
              </Button>
            </div>

            {/* Preview — image thumbnail, or PDF placeholder */}
            {isImageUrl(cadastral.url) ? (
              <a
                href={cadastral.url}
                target="_blank"
                rel="noreferrer"
                className="group relative block h-40 w-full overflow-hidden rounded-lg bg-surface"
                title="Open naksa in new tab"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cadastral.url}
                  alt={cadastral.altText ?? "Naksa preview"}
                  className="h-full w-full object-contain"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all duration-150 group-hover:bg-black/40 group-hover:opacity-100">
                  <Icon name="open_in_new" className="text-[24px]" />
                </span>
              </a>
            ) : (
              <a
                href={cadastral.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-24 w-full items-center justify-center gap-2 rounded-lg bg-surface transition-colors hover:bg-surface-container"
                title="Open naksa PDF in new tab"
              >
                <Icon
                  name="picture_as_pdf"
                  className="text-[32px] text-on-surface-variant"
                />
                <span className="max-w-[60%] truncate text-[12px] text-on-surface-variant">
                  {cadastral.altText}
                </span>
              </a>
            )}

            <div className="flex items-center justify-between gap-2">
              <span className="max-w-full truncate text-[12px] text-on-surface-variant">
                {cadastral.altText}
              </span>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 shrink-0 rounded-md border-outline-variant text-[12px] font-medium"
              >
                <a href={cadastral.url} target="_blank" rel="noreferrer">
                  <Icon name="visibility" className="text-[14px]" />
                  View
                </a>
              </Button>
            </div>
          </div>
        ) : (
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
            ) : null}
          </Button>
        )}
        <div className="flex flex-col gap-xs">
          <Label>
            Verification documents{" "}
            <span className="font-normal text-on-surface-variant">
              ({(draft.documents ?? []).length}/{MAX_DOCUMENTS})
            </span>
          </Label>
          <p className="text-[11px] text-on-surface-variant">
            Lalpurja, citizenship, tax clearance — reviewed during verification. PDF or image, max 10 MB each.
          </p>

          <input
            ref={docInputRef}
            type="file"
            accept={ACCEPTED_DOC_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleDocumentFile(e.target.files)}
          />

          <div className="flex items-center gap-2">
            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select document type…" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              disabled={!selectedDocType || docUploading || draft.documents.length >= MAX_DOCUMENTS}
              onClick={() => docInputRef.current?.click()}
              className="shrink-0"
            >
              {docUploading ? (
                <Icon name="progress_activity" className="animate-spin text-[16px]" />
              ) : (
                <Icon name="upload_file" className="text-[16px]" />
              )}
              <span className="ml-1.5 text-[13px]">Upload</span>
            </Button>
          </div>

          {draft.documents.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              {draft.documents.map((doc, i) => {
                const label = DOCUMENT_TYPE_OPTIONS.find((o) => o.value === doc.type)?.label ?? doc.type;
                return (
                  <div
                    key={doc.publicId ?? `${doc.fileUrl}-${i}`}
                    className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-3 py-2"
                  >
                    <Icon name="description" className="text-[18px] text-on-surface-variant shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[12px] font-medium text-on-surface">{label}</p>
                      <p className="truncate text-[11px] text-on-surface-variant">
                        {doc.fileName} · {doc.fileSizeMb} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove document"
                      onClick={() => removeDocument(doc)}
                      className="h-7 w-7 shrink-0 text-on-surface-variant hover:text-error"
                    >
                      <Icon name="close" className="text-[14px]" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {uploadError && (
        <p role="alert" className="text-[12px] text-error">
          {uploadError}
        </p>
      )}
    </div>
  );
}
