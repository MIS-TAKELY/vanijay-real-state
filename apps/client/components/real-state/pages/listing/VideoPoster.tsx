"use client";

import { Icon, cn } from "@repo/ui";
import { deriveVideoThumbnail } from "lib/media/videoThumbnail";
import { useEffect, useState } from "react";

type VideoPosterProps = {
  url: string;
  alt?: string;
  className?: string;
};

/**
 * First-frame poster for a walkthrough. Cloudinary jpg or YouTube thumbnail
 * for remote URLs; a muted blob <video> only while the file is still local.
 */
export function VideoPoster({ url, alt = "", className }: VideoPosterProps) {
  const thumbnail = deriveVideoThumbnail(url);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const failed = failedUrl === url;
  const isBlob = url.startsWith("blob:");

  useEffect(() => {
    setFailedUrl(null);
  }, [url]);

  if (thumbnail && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnail}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
        onError={() => setFailedUrl(url)}
      />
    );
  }

  if (isBlob) {
    return (
      <video
        src={url}
        muted
        playsInline
        preload="metadata"
        tabIndex={-1}
        aria-hidden
        className={cn("pointer-events-none h-full w-full object-cover", className)}
        onLoadedMetadata={(event) => {
          const el = event.currentTarget;
          if (el.currentTime === 0) el.currentTime = 0.1;
        }}
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-container">
      <Icon name="play_circle" className="text-[28px] text-on-surface-variant" />
    </div>
  );
}
