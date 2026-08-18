"use client";

import { useId, useRef, useState } from "react";
import { Button, Icon, Input, Label } from "@repo/ui";
import { adminUploadFile } from "lib/api";

const MAX_BYTES = 50 * 1024 * 1024;

interface CmsImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  recommended?: string;
  error?: string;
  errorId?: string;
}

export function CmsImageField({
  value,
  onChange,
  recommended = "Square (500x500px)",
  error,
  errorId,
}: CmsImageFieldProps) {
  const uid = useId();
  const urlId = `${uid}-url`;
  const hintId = `${uid}-hint`;
  const fieldErrorId = errorId ?? `${uid}-error`;
  const uploadErrorId = `${fieldErrorId}-upload`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploaded = Boolean(value.trim());

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError("Images must be 50MB or smaller.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const asset = await adminUploadFile(file, "misc");
      onChange(asset.secureUrl || asset.url);
    } catch {
      setUploadError("Upload failed. Try again or paste a URL.");
    } finally {
      setUploading(false);
    }
  }

  const describedBy = [
    hintId,
    error ? fieldErrorId : null,
    uploadError ? uploadErrorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={urlId}>Image</Label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        className={`flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
          dragOver
            ? "border-primary bg-secondary-container/40"
            : error
              ? "border-error/60 bg-surface-container"
              : "border-outline-variant bg-surface-container/40"
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="mb-1 h-20 w-20 rounded-md object-cover"
          />
        ) : (
          <Icon
            name="upload_file"
            className="text-[28px] text-on-surface-variant"
            aria-hidden
          />
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-outline-variant"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Icon
            name={uploading ? "progress_activity" : "upload_file"}
            className={uploading ? "animate-spin" : undefined}
          />
          {uploading ? "Uploading…" : "Choose Files"}
        </Button>
        <p id={hintId} className="text-xs text-on-surface-variant">
          Images only up to 50MB each. {uploaded ? "1" : "0"}/1 uploaded.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-describedby={describedBy}
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <p className="text-xs text-on-surface-variant">
        Recommended: {recommended}
      </p>
      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-outline-variant" />
        <span className="font-label-sm text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Or use URL
        </span>
        <span className="h-px flex-1 bg-outline-variant" />
      </div>
      <Input
        id={urlId}
        type="url"
        placeholder="https://example.com/image.jpg"
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(e) => {
          setUploadError(null);
          onChange(e.target.value);
        }}
        className="bg-surface"
      />
      {uploadError ? (
        <p id={uploadErrorId} role="alert" className="text-xs text-error">
          {uploadError}
        </p>
      ) : null}
      {error ? (
        <p id={fieldErrorId} role="alert" className="text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
