"use client";

import { useEffect, useRef } from "react";

type ListingVideoProps = {
  url: string;
  title?: string;
  className?: string;
};

// ─── URL parsers ───────────────────────────────────────────────────────────────

function youtubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const m = parsed.pathname.match(/\/(embed|shorts)\/([^/?]+)/);
      return m?.[2] ?? null;
    }
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function vimeoVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("vimeo.com")) return null;
    return parsed.pathname.match(/\/(\d+)/)?.[1] ?? null;
  } catch {
    return null;
  }
}

function tiktokVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("tiktok.com")) return null;
    return parsed.pathname.match(/\/video\/(\d+)/)?.[1] ?? null;
  } catch {
    return null;
  }
}

/** Returns shortcode + post type for an Instagram URL, or null. */
function instagramInfo(
  url: string,
): { code: string; type: "p" | "reel" | "tv" } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("instagram.com")) return null;
    const m = parsed.pathname.match(/\/(p|reel|reels|tv)\/([^/?]+)/);
    if (!m) return null;
    const rawType = m[1]!;
    const type: "p" | "reel" | "tv" =
      rawType === "p" ? "p" : rawType === "tv" ? "tv" : "reel";
    return { code: m[2]!, type };
  } catch {
    return null;
  }
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

// ─── Platform detectors that truly cannot embed ────────────────────────────────

type LinkOnlyPlatform = { name: string; gradient: string; icon: string };

function detectLinkOnly(url: string): LinkOnlyPlatform | null {
  try {
    const h = new URL(url).hostname;
    if (h.includes("twitter.com") || h.includes("x.com"))
      return {
        name: "X (Twitter)",
        icon: "✕",
        gradient: "from-[#14171a] to-[#1d9bf0]",
      };
    if (h.includes("facebook.com") || h.includes("fb.watch"))
      return {
        name: "Facebook",
        icon: "f",
        gradient: "from-[#1877f2] to-[#0c5fcd]",
      };
  } catch {
    /* ignore */
  }
  return null;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Card for platforms whose CSP prevents any iframe embedding. */
function ExternalLinkCard({
  url,
  platform,
  className,
}: {
  url: string;
  platform: LinkOnlyPlatform;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "aspect-video overflow-hidden rounded-2xl bg-surface-container"
      }
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full w-full flex-col items-center justify-center gap-4"
      >
        <div
          className={`flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl bg-gradient-to-br p-6 shadow-lg ${platform.gradient} text-white`}
        >
          <span className="text-5xl font-black" aria-hidden>
            {platform.icon}
          </span>
          <p className="text-base font-semibold">{platform.name}</p>
          <p className="text-center text-sm opacity-80">
            Click to watch on {platform.name}
          </p>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30">
            Open video ↗
          </span>
        </div>
        <p className="max-w-[90%] truncate text-center text-xs text-on-surface-variant">
          {url}
        </p>
      </a>
    </div>
  );
}

/**
 * Instagram embed using the official oEmbed blockquote + embed.js approach.
 * This is the only method Instagram officially supports for third-party sites.
 * The script is loaded once per page and activates all blockquotes it finds.
 */
function InstagramEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If Instagram's embed.js is already on the page, ask it to re-process
    // newly added blockquotes. Otherwise inject the script once.
    const win = window as typeof window & {
      instgrm?: { Embeds: { process(): void } };
    };

    if (win.instgrm?.Embeds) {
      win.instgrm.Embeds.process();
      return;
    }

    // Avoid duplicate script tags
    if (document.getElementById("instagram-embed-script")) {
      // Script is loading; it will auto-process on load
      return;
    }

    const script = document.createElement("script");
    script.id = "instagram-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [url]);

  return (
    <div
      ref={containerRef}
      className="flex w-full justify-center overflow-hidden rounded-2xl bg-[#fafafa] py-2"
    >
      {/* Instagram's embed.js finds this blockquote and replaces it with
          an interactive player iframe. data-instgrm-captioned is optional. */}
      <blockquote
        className="instagram-media w-full"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          background: "#FFF",
          border: "0",
          borderRadius: "3px",
          boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
          margin: "1px",
          maxWidth: "540px",
          minWidth: "326px",
          padding: "0",
          width: "99.375%",
        }}
      >
        {/* Fallback link shown before embed.js runs */}
        <div style={{ padding: "16px" }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#FFFFFF",
              lineHeight: "0",
              padding: "0 0",
              textAlign: "center",
              textDecoration: "none",
              width: "100%",
              display: "block",
            }}
          >
            View on Instagram ↗
          </a>
        </div>
      </blockquote>
    </div>
  );
}

/** TikTok embed using their official /embed/v2/ endpoint. */
function TikTokEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="flex w-full justify-center overflow-hidden rounded-2xl bg-[#010101]">
      <iframe
        src={`https://www.tiktok.com/embed/v2/${videoId}`}
        title={title}
        className="border-0"
        style={{ width: "100%", maxWidth: 325, minHeight: 580 }}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

/**
 * Universal walkthrough video player.
 *
 * | Source               | Method                                         |
 * |----------------------|------------------------------------------------|
 * | YouTube / Vimeo      | Looping autoplay iframe                        |
 * | Instagram Reel/post  | Official blockquote + embed.js (plays inline)  |
 * | TikTok               | Official /embed/v2/ iframe                     |
 * | Twitter/X, Facebook  | External link card (CSP blocks all iframes)    |
 * | Direct mp4/webm/mov  | Native <video> with object-contain             |
 * | Unknown URL          | Generic iframe attempt                         |
 */
export function ListingVideo({
  url,
  title = "Video walkthrough",
  className,
}: ListingVideoProps) {
  // 1. Platforms that truly cannot embed
  const linkOnly = detectLinkOnly(url);
  if (linkOnly) {
    return (
      <ExternalLinkCard url={url} platform={linkOnly} className={className} />
    );
  }

  // 2. Instagram — official blockquote embed
  const ig = instagramInfo(url);
  if (ig) {
    return <InstagramEmbed url={url} />;
  }

  // 3. TikTok — official embed endpoint
  const ttId = tiktokVideoId(url);
  if (ttId) {
    return <TikTokEmbed videoId={ttId} title={title} />;
  }

  // 4. YouTube / Vimeo — looping autoplay iframe
  const wrapperClass =
    className ??
    "aspect-video overflow-hidden rounded-2xl bg-surface-container";

  const ytId = youtubeVideoId(url);
  if (ytId) {
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      loop: "1",
      playlist: ytId,
      controls: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    return (
      <div className={wrapperClass}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?${params}`}
          title={title}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  const vimeoId = vimeoVideoId(url);
  if (vimeoId) {
    const params = new URLSearchParams({
      autoplay: "1",
      muted: "1",
      loop: "1",
      background: "0",
    });
    return (
      <div className={wrapperClass}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?${params}`}
          title={title}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  // 5. Direct file URL (Cloudinary, S3, etc.)
  if (isDirectVideo(url)) {
    return (
      <div className={wrapperClass}>
        <video
          src={url}
          className="h-full w-full object-contain"
          autoPlay
          muted
          loop
          playsInline
          controls
          aria-label={title}
        />
      </div>
    );
  }

  // 6. Unknown host — generic iframe attempt
  return (
    <div className={wrapperClass}>
      <iframe
        src={url}
        title={title}
        className="h-full w-full border-0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
