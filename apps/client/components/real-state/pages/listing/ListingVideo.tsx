type ListingVideoProps = {
  url: string;
  title?: string;
  className?: string;
};

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
 * Walkthrough player: prefers a looping iframe embed (YouTube/Vimeo).
 * Falls back to a looping <video> for direct Cloudinary/mp4 URLs.
 */
export function ListingVideo({
  url,
  title = "Video walkthrough",
  className,
}: ListingVideoProps) {
  const embed = loopingEmbedSrc(url);

  return (
    <div
      className={
        className ??
        "aspect-video overflow-hidden rounded-2xl bg-surface-container"
      }
    >
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
        // Direct file URLs (e.g. Cloudinary) don't loop reliably inside a bare
        // iframe, so use a native video element with the same autoplay+loop behavior.
        <video
          src={url}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          controls
          aria-label={title}
        />
      ) : (
        // Unknown host: still attempt iframe so the URL is playable in-page.
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
