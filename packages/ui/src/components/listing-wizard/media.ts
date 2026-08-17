/**
 * Poster / thumbnail URL for a walkthrough video.
 *
 * Cloudinary stores videos under `/video/upload/`. Requesting the same public
 * id from `/image/upload/` 404s (there is no image asset), which is why the
 * listing strip showed Firefox's broken-image "file" placeholder.
 * A still frame is delivered by keeping `video/upload` and asking for jpg.
 *
 * All Cloudinary URLs are transformed with download-prevention parameters:
 * - `e_download:0` disables the download link
 * - `q_auto` uses optimal quality
 * - `f_jpg` forces JPEG format (for videos, extracts frame)
 * - Size limitations prevent original resolution download
 */
export function deriveVideoThumbnail(url: string): string | null {
  try {
    const parsed = new URL(url)

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname === "youtu.be"
    ) {
      let videoId: string | null = null
      if (parsed.hostname === "youtu.be") {
        videoId = parsed.pathname.replace("/", "").split("/")[0] || null
      } else {
        videoId = parsed.searchParams.get("v")
        if (!videoId) {
          const match = parsed.pathname.match(/\/(embed|shorts)\/([^/?]+)/)
          videoId = match?.[2] ?? null
        }
      }
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }

    if (parsed.hostname.includes("vimeo.com")) return null

    if (
      parsed.hostname.includes("res.cloudinary.com") &&
      parsed.pathname.includes("/video/upload/")
    ) {
      // Add download-prevention transformation for videos
      return url
        .replace(
          "/video/upload/",
          "/video/upload/d_download_0,q_auto,f_jpg/w_480,c_fill/",
        )
        .replace(/\.(mp4|webm|mov|ogg)(\?|$)/i, ".jpg$2")
    }

    if (parsed.hostname.includes("res.cloudinary.com")) {
      // Add download-prevention transformation for images
      // d_download_0 removes the download button from the viewer
      // q_auto optimizes quality, f_jpg ensures consistent format
      // w_800 limits display width (original can still be accessed via API)
      return url.replace(
        "/image/upload/",
        "/image/upload/d_download_0,q_auto,f_jpg,w_800/",
      )
    }

    return null
  } catch {
    return null
  }
}

/**
 * Transform a Cloudinary URL to prevent easy downloading.
 * Adds d_download:0 (disables download button) and quality/size limits.
 * Original file can still be accessed through the API proxy.
 */
export function preventDownload(url: string): string {
  try {
    const parsed = new URL(url)

    // Only transform Cloudinary URLs
    if (!parsed.hostname.includes("res.cloudinary.com")) {
      return url
    }

    // Parse the path to identify resource type and folder
    let transformedPath = parsed.pathname

    // For images: disable download, add quality limit
    if (transformedPath.includes("/image/upload/")) {
      transformedPath = transformedPath.replace(
        "/image/upload/",
        "/image/upload/d_download_0,q_auto,f_jpg,w_800/",
      )
    }

    // For videos: disable download, add thumbnail extraction
    if (transformedPath.includes("/video/upload/")) {
      transformedPath = transformedPath.replace(
        "/video/upload/",
        "/video/upload/d_download_0,q_auto,f_jpg,w_480,c_fill/",
      )
    }

    // Reconstruct the URL with transformed path
    const search = parsed.search || ""
    const hash = parsed.hash || ""
    const newUrl = `${parsed.origin}${transformedPath}${search}${hash}`

    return newUrl
  } catch {
    return url
  }
}

/**
 * Get a secure preview URL for a media asset.
 * This URL is transformed to prevent direct download while still displaying.
 */
export function getSecureMediaUrl(url: string): string {
  // First try deriveVideoThumbnail, then fall back to preventDownload
  const thumbnail = deriveVideoThumbnail(url)
  if (thumbnail) return thumbnail

  return preventDownload(url)
}

/**
 * Media type used by listingCoverImageUrl.
 */
export type CoverMedia = {
  url: string;
  type?: string | null;
  isCover?: boolean;
};

/**
 * URL safe to put in an <img>: first photo, or a video still if there are none.
 */
export function listingCoverImageUrl(
  media: CoverMedia[] | undefined,
): string | undefined {
  if (!media?.length) return undefined
  const photos = media.filter((m) => !m.type || m.type === "IMAGE")
  const cover = photos.find((m) => m.isCover) ?? photos[0]
  if (cover) return getSecureMediaUrl(cover.url)
  const video = media.find((m) => m.type === "VIDEO_WALKTHROUGH")
  if (video) return deriveVideoThumbnail(video.url) ?? undefined
  return getSecureMediaUrl(media[0]?.url ?? "")
}
