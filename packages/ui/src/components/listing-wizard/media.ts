/**
 * Poster / thumbnail URL for a walkthrough video.
 *
 * Cloudinary stores videos under `/video/upload/`. Requesting the same public
 * id from `/image/upload/` 404s (there is no image asset), which is why the
 * listing strip showed Firefox's broken-image "file" placeholder.
 * A still frame is delivered by keeping `video/upload` and asking for jpg.
 */
export function deriveVideoThumbnail(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname === "youtu.be"
    ) {
      let videoId: string | null = null;
      if (parsed.hostname === "youtu.be") {
        videoId = parsed.pathname.replace("/", "").split("/")[0] || null;
      } else {
        videoId = parsed.searchParams.get("v");
        if (!videoId) {
          const match = parsed.pathname.match(/\/(embed|shorts)\/([^/?]+)/);
          videoId = match?.[2] ?? null;
        }
      }
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    if (parsed.hostname.includes("vimeo.com")) return null;

    if (
      parsed.hostname.includes("res.cloudinary.com") &&
      parsed.pathname.includes("/video/upload/")
    ) {
      return url
        .replace(
          "/video/upload/",
          "/video/upload/so_0,w_480,c_fill,q_auto,f_jpg/",
        )
        .replace(/\.(mp4|webm|mov|ogg)(\?|$)/i, ".jpg$2");
    }

    return null;
  } catch {
    return null;
  }
}

export type CoverMedia = {
  url: string;
  type?: string | null;
  isCover?: boolean;
};

/** URL safe to put in an <img>: first photo, or a video still if there are none. */
export function listingCoverImageUrl(
  media: CoverMedia[] | undefined,
): string | undefined {
  if (!media?.length) return undefined;
  const photos = media.filter((m) => !m.type || m.type === "IMAGE");
  const cover = photos.find((m) => m.isCover) ?? photos[0];
  if (cover) return cover.url;
  const video = media.find((m) => m.type === "VIDEO_WALKTHROUGH");
  if (video) return deriveVideoThumbnail(video.url) ?? undefined;
  return media[0]?.url;
}
