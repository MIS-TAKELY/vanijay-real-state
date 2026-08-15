type ListingVideoProps = {
  url: string;
  title?: string;
  className?: string;
};

/** Platforms that block <iframe> embedding via X-Frame-Options. */
type SocialPlatform = {
  name: string;
  icon: string; // emoji or text icon
  color: string; // Tailwind bg class
  textColor: string;
};

function detectSocialPlatform(url: string): SocialPlatform | null {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes("tiktok.com")) {
      return { name: "TikTok", icon: "♪", color: "bg-[#010101]", textColor: "text-white" };
    }
    if (hostname.includes("instagram.com")) {
      return { name: "Instagram", icon: "◉", color: "bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]", textColor: "text-white" };
    }
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      return { name: "X (Twitter)", icon: "✕", color: "bg-[#000000]", textColor: "text-white" };
    }
    if (hostname.includes("facebook.com") || hostname.includes("fb.watch")) {
      return { name: "Facebook", icon: "f", color: "bg-[#1877f2]", textColor: "text-white" };
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function youtubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const fromQuery = parsed.searchParams.get("v");
      if (fromQuery) return fromQuery;
      // /embed/ID or /shorts/ID
      const match = parsed.pathname.match(/\/(embed|shorts)\/([^/?]+)/);
      return match?.[2] ?? null;
    }
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.replace("/", "") || null;
    }
  } catch {
    return null;
  }
  return null;
}

function vimeoVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("vimeo.com")) return null;
    const match = parsed.pathname.match(/\/(\d+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

/** Build a looping, muted autoplay embed URL for known hosts. */
export function loopingEmbedSrc(url: string): string | null {
  const yt = youtubeVideoId(url);
  if (yt) {
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      loop: "1",
      playlist: yt, // required for YouTube single-video loop
      controls: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    return `https://www.youtube.com/embed/${yt}?${params.toString()}`;
  }

  const vimeo = vimeoVideoId(url);
  if (vimeo) {
    const params = new URLSearchParams({
      autoplay: "1",
      muted: "1",
      loop: "1",
      background: "0",
    });
    return `https://player.vimeo.com/video/${vimeo}?${params.toString()}`;
  }

  return null;
}

/**
 * Card rendered for platforms that block <iframe> embedding (TikTok, Instagram,
 * Twitter/X, Facebook). Shows the platform branding and opens in a new tab.
 */
function SocialLinkCard({
  url,
  platform,
  className,
}: {
  url: string;
  platform: SocialPlatform;
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
        className="flex h-full w-full flex-col items-center justify-center gap-4 transition-opacity hover:opacity-90"
        style={{ background: "inherit" }}
      >
        {/* Platform card */}
        <div
          className={[
            "flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl p-6 shadow-lg",
            platform.color,
            platform.textColor,
          ].join(" ")}
        >
          <span className="text-4xl font-bold" aria-hidden>
            {platform.icon}
          </span>
          <p className="text-base font-semibold">{platform.name}</p>
          <p className="text-center text-sm opacity-80">
            Tap to watch this video on {platform.name}
          </p>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
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
 * Walkthrough player:
 * - YouTube / Vimeo → looping iframe embed
 * - TikTok / Instagram / Twitter / Facebook → external link card (they block iframes)
 * - Direct mp4/webm/mov (e.g. Cloudinary) → native <video> with object-contain
 */
export function ListingVideo({
  url,
  title = "Video walkthrough",
  className,
}: ListingVideoProps) {
  // Check for platforms that block iframe embedding first
  const social = detectSocialPlatform(url);
  if (social) {
    return <SocialLinkCard url={url} platform={social} className={className} />;
  }

  const embed = loopingEmbedSrc(url);
  const wrapperClass =
    className ?? "aspect-video overflow-hidden rounded-2xl bg-surface-container";

  return (
    <div className={wrapperClass}>
      {embed ? (
        <iframe
          src={embed}
          title={title}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : isDirectVideo(url) ? (
        // Direct file URLs (e.g. Cloudinary): use object-contain so the full
        // video frame is visible — object-cover would crop to fill the 21:9 box
        // and show only the centre of the frame.
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
      ) : (
        // Unknown host — attempt a generic iframe. If the site blocks embedding
        // the user will see a browser error inside the frame rather than a blank.
        <iframe
          src={url}
          title={title}
          className="h-full w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  );
}
