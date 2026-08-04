"use client";

import { cn, Icon } from "@repo/ui";
import { useState } from "react";

const MOCK_PHOTOS = [
  "from-[#A8C0A0] to-[#5A7A55]",
  "from-[#C8C0B0] to-[#887860]",
  "from-[#90A8C0] to-[#4A6888]",
  "from-[#B0C8A0] to-[#688850]",
];

const DROP = "flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer";

export function StepMediaDocs() {
  const [photos, setPhotos] = useState<string[]>(MOCK_PHOTOS);
  const [videoUrl, setVideoUrl] = useState("");
  const [cadastral, setCadastral] = useState(false);

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col gap-md">
      {/* Image uploader grid */}
      <div className="flex flex-col gap-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-[13px] font-semibold text-on-surface">
            Photos <span className="font-normal text-on-surface-variant">({photos.length}/20)</span>
          </span>
          {photos.length > 0 ? (
            <span className="mono-stat text-[11px] text-on-surface-variant">
              Drag to reorder · first = cover
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-4">
          {photos.map((g, i) => (
            <div key={i} className="relative">
              <div className={cn("relative h-28 w-full rounded-xl bg-gradient-to-br", g)}>
                {i === 0 ? (
                  <span className="absolute left-2 top-2 rounded bg-surface/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-tertiary">
                    Cover
                  </span>
                ) : null}
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => removePhoto(i)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-surface/95 text-error shadow-sm hover:bg-error hover:text-white transition-colors cursor-pointer"
                >
                  <Icon name="close" className="text-[14px]" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" className={DROP} onClick={() => photos.length < 20 && setPhotos((p) => [...p, "from-[#D8B8A0] to-[#A08060]"])}>
            <span className="flex flex-col items-center gap-xs">
              <Icon name="add" className="text-[28px]" />
              <span className="text-[12px]">Add photo</span>
            </span>
          </button>
        </div>
      </div>

      {/* Video walkthrough URL */}
      <div className="flex flex-col gap-xs">
        <label htmlFor="w-video" className="font-label-sm text-[13px] font-semibold text-on-surface">
          Video walkthrough URL <span className="font-normal text-on-surface-variant">(optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <Icon name="videocam" className="text-[18px]" />
          </span>
          <input
            id="w-video"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/…"
            className="h-11 w-full rounded-md border border-outline bg-surface pl-10 pr-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>
      </div>

      {/* Cadastral map upload + document attach */}
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setCadastral((v) => !v)}
          className={cn(DROP, "h-auto flex-col gap-1 py-md")}
        >
          <Icon name="map" className="text-[28px]" />
          <span className="text-[13px] font-medium">Cadastral map (Naksa)</span>
          <span className="text-[11px] text-on-surface-variant">PDF / image, max 10MB</span>
          {cadastral ? <span className="text-[12px] text-primary">Uploaded ✓</span> : null}
        </button>
        <button type="button" className={cn(DROP, "h-auto flex-col gap-1 py-md")}>
          <Icon name="verified" className="text-[28px]" />
          <span className="text-[13px] font-medium">Attach document</span>
          <span className="text-[11px] text-on-surface-variant">Lalpurja, tax clearance…</span>
        </button>
      </div>
    </div>
  );
}
